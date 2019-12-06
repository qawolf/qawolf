import { logger } from "@qawolf/logger";
import { isNil, waitFor } from "@qawolf/web";
import { Browser } from "../browser/Browser";
import { registry } from "../browser/registry";
import { FindOptionsBrowser } from "../find/FindOptionsBrowser";
import { Page } from "./Page";

export interface FindPageOptions extends FindOptionsBrowser {
  index?: number;
}

const getIndex = (browser: Browser, pageIndex?: number): number => {
  let index = pageIndex;

  if (isNil(pageIndex)) {
    // if no index is specified use the current page
    index = browser._qawolf._currentPageIndex;

    // if the current page is closed, choose the first open page
    if (browser._qawolf.pages[index].isClosed()) {
      index = browser._qawolf.pages.findIndex(p => !p.isClosed());

      if (index < 0) throw new Error("No open pages");
    }
  }

  return index!;
};

export const findPage = async (options: FindPageOptions): Promise<Page> => {
  /**
   * Wait for the page and activate it.
   */
  const browser = options.browser || registry.single();

  const internal = browser._qawolf;

  let page = options.page || null;

  if (!page) {
    let index: number = getIndex(browser, options.index);

    page = await waitFor(() => {
      if (index >= internal.pages.length) return null;
      return internal.pages[index];
    }, options.timeoutMs || 0);

    if (!page) {
      throw new Error(`findPage: ${index} not found`);
    }
  }

  // when headless = false the tab needs to be activated
  // for the execution context to run
  await page.bringToFront();

  if (options.waitForRequests) {
    await page.qawolf.waitForRequests();
  }

  internal._currentPageIndex = internal.pages.indexOf(page);
  logger.verbose(
    `findPage: activated ${internal._currentPageIndex} ${page.url()}`
  );

  return page;
};
