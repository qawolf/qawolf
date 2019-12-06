import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { FindOptions, Selector } from "@qawolf/types";
import { isNil, sleep } from "@qawolf/web";
import { ElementHandle, Page as PuppeteerPage } from "puppeteer";
import { findPage } from "../page/findPage";
import { findCss } from "./findCss";
import { findHtml } from "./findHtml";
import { FindOptionsBrowser } from "./FindOptionsBrowser";
import { findText } from "./findText";
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
  selector: Selector,
  options: FindOptionsBrowser = {}
) => {
  const {
    // remove non-serializable options from findOptions
    browser: browserOption,
    page: pageOption,
    ...findOptions
  } = getConfigOptions(options);
  logger.verbose(
    `find: ${JSON.stringify(selector)} ${JSON.stringify(findOptions)}`
  );

  const page = await findPage({
    browser: browserOption,
    index: selector.page,
    page: pageOption
  });

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

const getConfigOptions = <T extends FindOptions>(options: T) => {
  const findOptions = { ...options };

  if (isNil(options.sleepMs)) {
    findOptions.sleepMs = CONFIG.sleepMs;
  }

  if (isNil(options.timeoutMs)) {
    findOptions.timeoutMs = CONFIG.findTimeoutMs;
  }

  return findOptions;
};
