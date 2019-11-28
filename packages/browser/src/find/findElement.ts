import { FindOptions } from "@qawolf/types";
import { ElementHandle, Page } from "puppeteer";
import { findHtml, HtmlSelector } from "./findHtml";

// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
export type CssSelector = string;

export type Selector =
  | CssSelector
  | {
      html?: HtmlSelector;
      text?: string;
    };

export const findElement = async (
  page: Page,
  selector: Selector,
  options: FindOptions
): Promise<ElementHandle | null> => {
  if (typeof selector === "string") {
    // return findCss(page, selector, findTimeoutMs);
    throw new Error("TODO");
  }

  if (selector.html) {
    return findHtml(page, selector.html, options);
  }

  // if (selector.text) {
  //   return findText(page, selector.text, findTimeoutMs);
  // }

  throw new Error(`Invalid selector ${selector}`);
};
