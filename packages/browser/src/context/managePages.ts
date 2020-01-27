import { CONFIG } from "@qawolf/config";
import { decoratePage } from "../page/decoratePage";
import { Page } from "../page/Page";
import { QAWolfBrowserContext } from "./QAWolfBrowserContext";

export const ensurePagesAreDecorated = async (
  context: QAWolfBrowserContext
): Promise<Page[]> => {
  /**
   * Ensure each Playwright page is decorated with a QAWolfPage.
   */
  const playwrightPages = await context.decorated.pages();

  const promises = playwrightPages.map(async (playwrightPage: any) => {
    if (playwrightPage.qawolf) return;

    const page = await decoratePage({
      index: context._pages.length,
      logLevel: context.logLevel,
      playwrightPage,
      recordDom: !!CONFIG.artifactPath,
      recordEvents: context.recordEvents
    });
    context._pages[page.qawolf.index] = page;

    return page;
  });

  await Promise.all(promises);

  return context._pages;
};

export const managePages = async (context: QAWolfBrowserContext) => {
  // constantly check for new pages to decorate
  // workaround for https://github.com/microsoft/playwright/pull/645
  const intervalId = setInterval(async () => {
    await ensurePagesAreDecorated(context);
  }, 500);

  const dispose = () => clearInterval(intervalId);
  return dispose;
};
