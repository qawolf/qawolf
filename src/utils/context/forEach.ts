import { BrowserContext, Frame, Page } from 'playwright';

type FrameParams = {
  frame: Frame;
  page: Page;
};

export const forEachPage = async (
  context: BrowserContext,
  pageFn: (page: Page) => any,
): Promise<void> => {
  context.on('page', (page) => pageFn(page));

  const pagePromises = context.pages().map((page) => pageFn(page));

  await Promise.all(pagePromises);
};

export const forEachFrame = async (
  context: BrowserContext,
  frameFn: (params: FrameParams) => any,
): Promise<void> => {
  await forEachPage(context, async (page) => {
    const framePromises = page
      .frames()
      .map((frame) => frameFn({ page, frame }));

    page.on('frameattached', (frame) => frameFn({ page, frame }));

    await Promise.all(framePromises);
  });
};
