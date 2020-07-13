import { Page } from 'playwright-core';
import { forEachPage, launch, waitForPage, register } from '../../../src/utils';

it('runs for existing and new pages', async () => {
  const browser = await launch();
  const context = await browser.newContext();

  const existingPage = await context.newPage();

  let index = 0;

  await forEachPage(context, (page: Page) => {
    page.evaluate((index: number) => ((window as any).index = index), index++);
  });

  // index pages before more than one exists
  const pageOneReady = waitForPage(context, 1);
  const newPage = await context.newPage();
  await pageOneReady;

  const result = await Promise.all(
    [existingPage, newPage].map((page) =>
      page.evaluate(() => (window as any).index),
    ),
  );
  expect(result).toEqual([0, 1]);

  await browser.close();
});
