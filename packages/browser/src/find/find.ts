import { FindOptions, Selector } from "@qawolf/types";
import { ElementHandle, Page } from "puppeteer";
import { findCss } from "./findCss";
import { findHtml } from "./findHtml";
import { findText } from "./findText";
import { retryExecutionError } from "../retry";

export const find = (
  page: Page,
  selector: Selector,
  options: FindOptions
): Promise<ElementHandle | null> => {
  return retryExecutionError(async () => {
    if (selector.css) {
      return findCss(page, selector.css, options);
    }

    if (selector.html) {
      return findHtml(page, selector.html, options);
    }

    if (selector.text) {
      return findText(page, selector.text, options);
    }

    throw new Error(`Invalid selector ${selector}`);
  });
};
