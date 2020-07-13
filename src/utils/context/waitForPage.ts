import { BrowserContext } from 'playwright-core';
import { isNull } from 'util';
import { IndexedPage, isRegistered } from './register';
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
  if (!isRegistered(this._context)) {
    throw new Error('Use qawolf.register(context) before qawolf.waitForPage');
  }

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

  if (!isNull(options.waitUntil)) {
    await page.waitForLoadState(options.waitUntil || 'load');
  }

  return page as IndexedPage;
};
