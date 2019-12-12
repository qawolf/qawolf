import { logger } from "@qawolf/logger";
import { FindOptions } from "@qawolf/types";
import { isNil, waitFor } from "@qawolf/web";
import { Browser } from "../browser/Browser";
import { Page } from "./Page";

export interface FindPageOptions extends FindOptions {
  page?: number;
}

const getIndex = (browser: Browser, pageIndex?: number): number => {
  let index = pageIndex;

  if (isNil(pageIndex)) {
    const qawolf = browser.qawolf;

    // if no index is specified use the current page
    index = qawolf._currentPageIndex;

    // if the current page is closed, choose the first open page
    if (qawolf.pages[index].isClosed()) {
      index = qawolf.pages.findIndex(p => !p.isClosed());

      if (index < 0) throw new Error("No open pages");
    }
  }

  return index!;
};

export const findPage = async (
  browser: Browser,
  options: FindPageOptions
): Promise<Page> => {
  /**
   * Wait for the page and activate it.
   */
  const qawolf = browser.qawolf;

  let index: number = getIndex(browser, options.page);

  const page = await waitFor(() => {
    if (index >= qawolf.pages.length) return null;
    return qawolf.pages[index];
  }, options.timeoutMs || 0);

  if (!page) {
    throw new Error(`findPage: ${index} not found`);
  }

  // when headless = false the tab needs to be activated
  // for the execution context to run
  await page.bringToFront();

  if (options.waitForRequests) {
    await page.qawolf.waitForRequests();
  }

  qawolf._currentPageIndex = qawolf.pages.indexOf(page);
  logger.verbose(
    `findPage: activated ${qawolf._currentPageIndex} ${page.url()}`
  );

  return page;
};
