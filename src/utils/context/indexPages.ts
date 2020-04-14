import Debug from 'debug';
import { BrowserContext, Page } from 'playwright-core';

const debug = Debug('qawolf:indexPages');

type IndexedBrowserContext = BrowserContext & {
  _putilsIndexed: boolean;
};

export type IndexedPage = Page & {
  createdIndex: number;
};

export const indexPages = async (context: BrowserContext): Promise<void> => {
  /**
   * Set page.createdIndex on pages.
   */
  if ((context as IndexedBrowserContext)._putilsIndexed) return;
  (context as IndexedBrowserContext)._putilsIndexed = true;

  let index = 0;

  const pages = context.pages();
  if (pages.length > 1) {
    throw new Error(
      `Cannot index pages when more than 1 exist (${pages.length})`,
    );
  }

  if (pages[0]) {
    debug(`index existing page ${index}`);
    (pages[0] as IndexedPage).createdIndex = index++;
  }

  context.on('page', (page: IndexedPage) => {
    debug(`index created page ${index}`);
    page.createdIndex = index++;
  });
};
