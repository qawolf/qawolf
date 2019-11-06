import { logger } from "@qawolf/logger";
import { QAWolfWeb, sleep } from "@qawolf/web";
import { ScrollValue } from "@qawolf/types";
import { ElementHandle, Page } from "puppeteer";
import { buildCodeString } from "./keyboard";

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

  const codes = buildCodeString(value);

  // down & up so we can handle @ etc
  // split by ↓,↑ with positive lookahead https://stackoverflow.com/a/12001989
  for (let key of codes.split(/(?=↓|↑)/)) {
    const code = (key as string).substring(1);

    if (key[0] === "↓") {
      await page.keyboard.down(code);
    } else {
      await page.keyboard.up(code);
    }

    await sleep(50);
  }
};
