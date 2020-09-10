import { BrowserContext } from 'playwright';
import { IndexedPage, indexPages } from './indexPages';
import { waitFor } from '../waitFor';

export interface GetPageAtIndexOptions {
  timeout?: number;
}

export const getPageAtIndex = async (
  context: BrowserContext,
  index: number,
  options: GetPageAtIndexOptions = {},
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

  return page as IndexedPage;
};
