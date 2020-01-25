import { CONFIG } from "@qawolf/config";
import { decoratePage } from "../page/decoratePage";
import { Page } from "../page/Page";
import { QAWolfBrowserContext } from "./QAWolfBrowserContext";

export const ensurePagesAreDecorated = async (
  qawolfBrowserContext: QAWolfBrowserContext
): Promise<Page[]> => {
  /**
   * Ensure each Playwright page is decorated with a QAWolfPage.
   */
  const playwrightPages = await qawolfBrowserContext.decorated.pages();

  const promises = playwrightPages.map(async (playwrightPage: any) => {
    if (playwrightPage.qawolf) return;

    await decoratePage({
      logLevel: qawolfBrowserContext.logLevel,
      playwrightPage,
      // TODO fix
      // does not make sense for this to be static, should be dynamic based on current pages...
      index: 0,
      recordDom: !!CONFIG.artifactPath,
      recordEvents: qawolfBrowserContext.recordEvents
    });
  });

  await Promise.all(promises);

  return playwrightPages as Page[];
};
