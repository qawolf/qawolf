import { BrowserContext } from 'playwright';
import { IndexedPage } from './indexPages';
import { getPageAtIndex } from './getPageAtIndex';

export interface WaitForPageOptions {
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}

export const waitForPage = async (
  context: BrowserContext,
  index: number,
  options: WaitForPageOptions = {},
): Promise<IndexedPage> => {
  const page = await getPageAtIndex(context, index, { timeout: options.timeout });

  if (options.waitUntil !== null) {
    await page.waitForLoadState(options.waitUntil || 'load');
  }

  await page.bringToFront();

  return page as IndexedPage;
};
