import { logger } from "@qawolf/logger";
import {
  CssSelector,
  FindElementOptions,
  HtmlSelector,
  Selector,
  TextSelector
} from "@qawolf/types";
import { sleep } from "@qawolf/web";
import { ElementHandle, Page as PuppeteerPage } from "puppeteer";
import { findCss } from "./findCss";
import { findHtml } from "./findHtml";
import { findText } from "./findText";
import { getFindElementOptions } from "./getFindElementOptions";
import { retryExecutionError } from "../retry";

export const findElement = (
  page: PuppeteerPage,
  selector: Selector,
  options: FindElementOptions
): Promise<ElementHandle> => {
  return retryExecutionError(async () => {
    if ((selector as CssSelector).css) {
      return findCss(page, selector as CssSelector, options);
    }

    if ((selector as HtmlSelector).html) {
      return findHtml(page, selector as HtmlSelector, options);
    }

    if ((selector as TextSelector).text) {
      return findText(page, selector as TextSelector, options);
    }

    throw new Error(`Invalid selector ${selector}`);
  });
};

export const find = async (
  page: PuppeteerPage,
  selector: Selector,
  options: FindElementOptions = {}
): Promise<ElementHandle> => {
  const findOptions = getFindElementOptions(options);
  logger.verbose(
    `find: ${JSON.stringify(selector)} ${JSON.stringify(findOptions)}`
  );

  let element = await findElement(page, selector, findOptions);

  if (findOptions.sleepMs) {
    logger.verbose(`find: found element, sleeping ${findOptions.sleepMs}ms`);
    await sleep(findOptions.sleepMs);

    // reload the element in case it changed since the sleep
    try {
      // try to find it immediately
      logger.verbose(`find: find element after sleep (timeoutMs: 0)`);
      element = await findElement(page, selector, {
        ...findOptions,
        timeoutMs: 0
      });
    } catch (e) {
      // if it cannot be found immediately wait longer
      logger.verbose(
        `find: element not found immediately, try slower ${JSON.stringify(
          findOptions
        )}`
      );
      element = await findElement(page, selector, findOptions);
    }
  }

  return element;
};
