import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { isNil, DocSelector } from "@qawolf/web";
import { ElementHandle, Page } from "puppeteer";
import { findHtml } from "./findHtml";

export type Locator =
  // a selector string
  | string
  | {
      docSelector?: DocSelector;
      html?: string;
      selector?: string;
      text?: string;
    };

// TODO..
export const find = async (
  page: Page,
  locator: Locator,
  timeoutMs?: number
): Promise<ElementHandle> => {
  logger.verbose(`find: ${JSON.stringify(locator).substring(0, 100)}`);
  const findTimeoutMs = (isNil(timeoutMs) ? CONFIG.findTimeoutMs : timeoutMs)!;

  //   if (typeof locator === "string") {
  //     return findSelector(page, locator, findTimeoutMs);
  //   }

  //   if (locator.selector) {
  //     return findSelector(page, locator.selector, findTimeoutMs);
  //   }

  if (locator.html) {
    return findHtml(page, locator.html, findTimeoutMs);
  }

  //   if (locator.text) {
  //     return findText(page, locator.text, findTimeoutMs);
  //   }

  throw new Error(`Invalid locator ${locator}`);
};
