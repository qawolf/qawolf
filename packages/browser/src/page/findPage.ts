import { logger } from "@qawolf/logger";
import { FindPageOptions } from "@qawolf/types";
import { isNil, waitFor } from "@qawolf/web";
import { QAWolfBrowserContext } from "../context/QAWolfBrowserContext";
import { Page } from "./Page";

const getIndex = async (
  context: QAWolfBrowserContext,
  pageIndex?: number
): Promise<number> => {
  if (!isNil(pageIndex)) {
    return pageIndex!;
  }

  const openPages = (await context.pages()).filter(page => !page.isClosed());

  if (openPages.length < 1) {
    throw new Error("No open pages");
  }

  // use the current page index if it is open
  if (openPages.find(p => p.qawolf.index === context._currentPageIndex)) {
    return context._currentPageIndex;
  }

  return 0;
};

export const findPage = async (
  context: QAWolfBrowserContext,
  options: FindPageOptions
): Promise<Page> => {
  /**
   * Wait for the page and activate it.
   */
  let index: number = await getIndex(context, options.page);

  const page = await waitFor(
    async () => {
      const pages = await context.pages();

      if (index >= pages.length) return null;

      return pages[index];
    },
    isNil(options.timeoutMs) ? 5000 : options.timeoutMs!
  );

  if (!page) {
    throw new Error(`findPage: page ${index} not found`);
  }

  // when headless = false the tab needs to be activated
  // for the execution context to run
  // TODO
  // await page.bringToFront();

  if (options.waitForRequests) {
    await page.waitForRequest(/.*/g);
  }

  context._currentPageIndex = index;

  logger.verbose(
    `findPage: activated ${context._currentPageIndex} ${page.url()}`
  );

  return page;
};
