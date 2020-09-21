import { BrowserContext } from 'playwright';
import { IndexedPage, indexPages } from './indexPages';
import { waitFor } from '../waitFor';

export interface WaitForPageOptions {
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}

export const waitForPage = async (
  context: BrowserContext,
  index: number,
  options: WaitForPageOptions = {},
): Promise<IndexedPage> => {
  // index pages if they are not yet
  await indexPages(context);

  const page = await waitFor(
    async () => {
      const pages = context.pages();
      const match = pages.find(
        (page) => (page as IndexedPage).createdIndex === index,
      );
      return match;
    },
    { timeout: options.timeout || 30000 },
  );

  if (options.waitUntil !== null) {
    await page.waitForLoadState(options.waitUntil || 'load');
  }

  await page.bringToFront();

  return page as IndexedPage;
};
