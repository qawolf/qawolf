import { logger } from "@qawolf/logger";
import { FindPageOptions } from "@qawolf/types";
import { isNil, waitFor } from "@qawolf/web";
import { Browser } from "../browser/Browser";
import { Page } from "./Page";

const getIndex = async (
  browser: Browser,
  pageIndex?: number
): Promise<number> => {
  let index = pageIndex;

  if (isNil(pageIndex)) {
    const qawolf = browser.qawolf;

    // if no index is specified use the current page
    index = qawolf._currentPageIndex;

    const pages = await qawolf.pages();

    // if the current page is closed, choose the first open page
    if (pages[index].isClosed()) {
      index = pages.findIndex(p => !p.isClosed());

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

  let index: number = await getIndex(browser, options.page);

  const page = await waitFor(
    async () => {
      const pages = await qawolf.pages();
      if (index >= pages.length) return null;
      return pages[index];
    },
    isNil(options.timeoutMs) ? 5000 : options.timeoutMs!
  );

  if (!page) {
    throw new Error(`findPage: ${index} not found`);
  }

  // when headless = false the tab needs to be activated
  // for the execution context to run
  // TODO
  // await page.bringToFront();

  if (options.waitForRequests) {
    await page.waitForRequest(/.*/g);
  }

  qawolf._currentPageIndex = index;

  logger.verbose(
    `findPage: activated ${qawolf._currentPageIndex} ${page.url()}`
  );

  return page;
};
