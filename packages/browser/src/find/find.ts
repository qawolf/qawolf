import { FindOptions } from "@qawolf/types";
import { ElementHandle, Page } from "puppeteer";
import { findCss } from "./findCss";
import { findHtml, HtmlSelector } from "./findHtml";
import { findText } from "./findText";

// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
export type CssSelector = string;

export type Selector =
  | CssSelector
  | {
      html?: HtmlSelector;
      text?: string;
    };

export const find = async (
  page: Page,
  selector: Selector,
  options: FindOptions
): Promise<ElementHandle | null> => {
  if (typeof selector === "string") {
    return findCss(page, selector, options);
  }

  if (selector.html) {
    return findHtml(page, selector.html, options);
  }

  if (selector.text) {
    return findText(page, selector.text, options);
  }

  throw new Error(`Invalid selector ${selector}`);
};
