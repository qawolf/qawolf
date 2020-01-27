import { CONFIG } from "@qawolf/config";
import { decoratePage } from "../page/decoratePage";
import { Page } from "../page/Page";
import { QAWolfBrowserContext } from "./QAWolfBrowserContext";

export const decoratePages = async (
  context: QAWolfBrowserContext
): Promise<Page[]> => {
  /**
   * Ensure each Playwright page is decorated with a QAWolfPage.
   */
  const playwrightPages = await context.decorated.pages();

  const pages = await Promise.all(
    playwrightPages.map(async (playwrightPage: any) => {
      if (playwrightPage.qawolf) return playwrightPage as Page;

      // the first time we encounter a new page index it
      const index = context._nextPageIndex++;

      const page = await decoratePage({
        index,
        logLevel: context.logLevel,
        playwrightPage,
        recordDom: !!CONFIG.artifactPath,
        recordEvents: context.recordEvents
      });

      return page;
    })
  );

  return pages.sort((a, b) => a.qawolf.index - b.qawolf.index);
};
