import { logger } from "@qawolf/logger";
import { FindOptions, Selector } from "@qawolf/types";
import { sleep } from "@qawolf/web";
import { ElementHandle, Page as PuppeteerPage } from "puppeteer";
import { findCss } from "./findCss";
import { findHtml } from "./findHtml";
import { findText } from "./findText";
import { getFindOptions } from "./getFindOptions";
import { retryExecutionError } from "../retry";

export const findElement = (
  page: PuppeteerPage,
  selector: Selector,
  options: FindOptions
): Promise<ElementHandle | null> => {
  return retryExecutionError(async () => {
    if (selector.css) {
      return findCss(page, selector, options);
    }

    if (selector.html) {
      return findHtml(page, selector, options);
    }

    if (selector.text) {
      return findText(page, selector, options);
    }

    throw new Error(`Invalid selector ${selector}`);
  });
};

export const find = async (
  page: PuppeteerPage,
  selector: Selector,
  options: FindOptions = {}
) => {
  const findOptions = getFindOptions(options);
  logger.verbose(
    `find: ${JSON.stringify(selector)} ${JSON.stringify(findOptions)}`
  );

  let element = await findElement(page, selector, findOptions);

  if (findOptions.sleepMs) {
    logger.verbose(`find: sleep ${findOptions.sleepMs} ms`);

    await sleep(findOptions.sleepMs);

    // reload the element in case it changed since the sleep
    try {
      // try to find it immediately
      element = await findElement(page, selector, {
        ...findOptions,
        timeoutMs: 0
      });
    } catch (e) {
      // if it cannot be found immediately wait longer
      element = await findElement(page, selector, findOptions);
    }
  }

  if (!element) throw new Error("Element not found");

  return element;
};
