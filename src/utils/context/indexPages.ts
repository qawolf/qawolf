import Debug from 'debug';
import { BrowserContext, Page } from 'playwright';

export type IndexedPage = Page & {
  createdIndex: number;
};

type IndexedBrowserContext = BrowserContext & {
  _qawIndexed: boolean;
};

const debug = Debug('qawolf:indexPages');

export const indexPages = async (context: BrowserContext): Promise<void> => {
  /**
   * Set page.createdIndex on pages.
   */
  if ((context as IndexedBrowserContext)._qawIndexed) return;
  (context as IndexedBrowserContext)._qawIndexed = true;

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
