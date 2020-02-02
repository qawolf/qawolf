import { CONFIG } from "@qawolf/config";
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
  logger.debug(`findPage: options.page ${options.page} page ${index}`);

  const timeoutMs = isNil(options.timeoutMs)
    ? CONFIG.timeoutMs
    : options.timeoutMs!;

  const page = await waitFor(async () => {
    const pages = await context.pages();

    if (index >= pages.length) {
      return null;
    }

    return pages[index];
  }, timeoutMs);

  if (!page) {
    throw new Error(`findPage: page ${index} not found after ${timeoutMs}ms`);
  }

  // TODO waiting for https://github.com/microsoft/playwright/issues/657 for cross browser support
  if (context.browserType === "chromium") {
    logger.verbose("findPage: Page.bringToFront");
    const client = await (context.browser as any)
      .pageTarget(page)
      .createCDPSession();
    await client.send("Page.bringToFront");
    client.detach();
  }

  if (options.waitForRequests !== false) {
    await page.qawolf.waitForRequests();
  }

  context._currentPageIndex = index;

  logger.verbose(
    `findPage: activated ${context._currentPageIndex} ${page.url()}`
  );

  return page;
};
