import { CONFIG } from "@qawolf/config";
import { Page } from "../page/Page";
import { QAWolfBrowserContext } from "./QAWolfBrowserContext";
import { QAWolfPage } from "../page/QAWolfPage";

export const decoratePages = async (
  context: QAWolfBrowserContext
): Promise<Page[]> => {
  /**
   * Ensure each Playwright page is decorated with a QAWolfPage.
   */
  const playwrightPages = await context.decorated().pages();

  const pages = await Promise.all(
    playwrightPages.map(async (playwrightPage: any) => {
      if (playwrightPage.qawolf) {
        const page = playwrightPage as Page;
        await page.qawolf().ready();
        return page;
      }

      // the first time we encounter a new page index it
      const index = context._nextPageIndex++;

      const page = new QAWolfPage({
        index,
        logLevel: context.logLevel(),
        playwrightPage,
        shouldRecordDom: !!CONFIG.artifactPath,
        shouldRecordEvents: context.shouldRecordEvents()
      });

      await page.ready();

      const decorated = page.decorated();
      context._registerPage(decorated);
      return decorated;
    })
  );

  return pages.sort((a, b) => a.qawolf().index() - b.qawolf().index());
};

export const managePages = (context: QAWolfBrowserContext) => {
  decoratePages(context);

  // constantly check for new pages to decorate
  // workaround for https://github.com/microsoft/playwright/pull/645
  const intervalId = setInterval(() => decoratePages(context), 500);

  const dispose = () => clearInterval(intervalId);
  return dispose;
};
