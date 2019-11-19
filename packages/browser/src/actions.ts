import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { ScrollValue } from "@qawolf/types";
import { QAWolfWeb, sleep } from "@qawolf/web";
import { ElementHandle, Page } from "puppeteer";
import { valueToStrokes } from "./keyboard";

export const click = async (element: ElementHandle): Promise<void> => {
  logger.verbose("actions.click");
  await element.click();
};

export const focusClear = async (
  elementHandle: ElementHandle
): Promise<void> => {
  logger.verbose("actions.focusClear: focus element");
  await elementHandle.focus();

  const currentValue = await elementHandle.evaluate((element: HTMLElement) => {
    if (element.isContentEditable) return element.innerText;

    return (element as HTMLInputElement).value;
  });

  if (currentValue) {
    logger.verbose("actions.focusClear: clear element");

    // Select all so we replace the text
    // from https://github.com/GoogleChrome/puppeteer/issues/1313#issuecomment-471732011
    // We do this instead of setting the value directly since that does not mimic user behavior.
    // Ex. Some sites might rely on an isTrusted change event which we cannot simulate.
    await elementHandle.evaluate(() =>
      document.execCommand("selectall", false, "")
    );
    await elementHandle.press("Backspace");
  }
};

export const scroll = async (
  elementHandle: ElementHandle,
  value: ScrollValue,
  timeoutMs: number = 10000
): Promise<void> => {
  logger.verbose("actions.scroll");
  await elementHandle.evaluate(
    (element, value, timeoutMs) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.scroll(element, value, timeoutMs);
    },
    value,
    timeoutMs
  );
};

export const select = async (
  elementHandle: ElementHandle,
  value: string | null,
  timeoutMs?: number
): Promise<void> => {
  logger.verbose("actions.select");
  // ensure option with desired value is loaded before selecting
  await elementHandle.evaluate(
    (element: HTMLSelectElement, value: string | null, timeoutMs: number) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.select.waitForOption(element, value, timeoutMs);
    },
    value,
    timeoutMs || CONFIG.findTimeoutMs
  );

  await elementHandle.select(value || "");
};

export const type = async (page: Page, value: string): Promise<void> => {
  logger.verbose("actions.type");

  // logging the keyboard codes below will leak secrets
  // which is why we have it hidden behind the DEBUG flag
  // since we default logs to VERBOSE
  for (const stroke of valueToStrokes(value)) {
    if (stroke.type === "↓") {
      logger.debug(`keyboard.down("${stroke.value}")`);
      await page.keyboard.down(stroke.value);
    } else if (stroke.type === "↑") {
      logger.debug(`keyboard.up("${stroke.value}")`);
      await page.keyboard.up(stroke.value);
    } else if (stroke.type === "→") {
      logger.debug(`keyboard.sendCharacter("${stroke.value}")`);
      await page.keyboard.sendCharacter(stroke.value);
    }

    await sleep(CONFIG.keyDelayMs);
  }
};
