import { logger } from "@qawolf/logger";
import { QAWolfWeb, sleep } from "@qawolf/web";
import { ScrollValue } from "@qawolf/types";
import { ElementHandle, Page } from "puppeteer";
import { convertStringToStrokes } from "./keyboard";

export const click = async (element: ElementHandle): Promise<void> => {
  logger.verbose("actions.click");
  await element.click();
};

export const focusClearInput = async (
  elementHandle: ElementHandle
): Promise<void> => {
  logger.verbose("actions.focusClearInput");
  await elementHandle.focus();

  const currentValue = await elementHandle.evaluate(
    element => (element as HTMLInputElement).value
  );

  if (currentValue) {
    // select all so we replace the text
    // from https://github.com/GoogleChrome/puppeteer/issues/1313#issuecomment-471732011
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

  for (const stroke of convertStringToStrokes(value)) {
    if (stroke.prefix === "↓") {
      await page.keyboard.down(stroke.code);
    } else {
      await page.keyboard.up(stroke.code);
    }

    await sleep(10);
  }
};
