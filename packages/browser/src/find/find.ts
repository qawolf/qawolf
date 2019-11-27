import { logger } from "@qawolf/logger";
import { FindOptions, HtmlSelector } from "@qawolf/types";
import { ElementHandle, Page } from "puppeteer";
import { findHtml } from "./findHtml";

export type Selector = {
  html?: HtmlSelector;
  text?: string;
};

export const find = async (
  page: Page,
  selector: string | Selector,
  options: FindOptions
): Promise<ElementHandle> => {
  logger.verbose(`find: ${JSON.stringify(selector).substring(0, 100)}`);

  //   if (typeof selector === "string") {
  //     return findSelector(page, selector, findTimeoutMs);
  //   }

  if (selector.html) {
    return findHtml(page, selector.html, options);
  }

  //   if (selector.text) {
  //     return findText(page, selector.text, findTimeoutMs);
  //   }

  throw new Error(`Invalid selector ${selector}`);
};
