import { BrowserContext, Page } from 'playwright-core';

export const forEachPage = async (
  context: BrowserContext,
  pageFn: (page: Page) => any,
): Promise<void> => {
  context.on('page', (page) => pageFn(page));

  const pagePromises = context.pages().map((page) => pageFn(page));

  await Promise.all(pagePromises);
};
