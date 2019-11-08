import { logger } from "@qawolf/logger";
import { ScrollValue } from "@qawolf/types";
import { QAWolfWeb, sleep } from "@qawolf/web";
import { ElementHandle, Page } from "puppeteer";
import { convertStringToStrokes } from "./keyboard";

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
    logger.verbose("actions.focusClear: clearing value");

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
  value: string | null
): Promise<void> => {
  logger.verbose("actions.select");
  await elementHandle.select(value || "");
};

export const type = async (page: Page, value: string): Promise<void> => {
  logger.verbose("actions.type");

  // logging the keyboard codes below will leak secrets
  // which is why we have it hidden behind the DEBUG flag
  // since we default logs to VERBOSE
  for (const stroke of convertStringToStrokes(value)) {
    if (stroke.prefix === "↓") {
      logger.debug(`keyboard.down("${stroke.code}")`);
      await page.keyboard.down(stroke.code);
    } else {
      logger.debug(`keyboard.up("${stroke.code}")`);
      await page.keyboard.up(stroke.code);
    }

    await sleep(25);
  }
};
