import { Page } from 'playwright';
import {
  forEachFrame,
  forEachPage,
  launch,
  waitFor,
  waitForPage,
} from '../../../src/utils';
import { TEST_URL } from '../../utils';

it('runs for existing and new frames', async () => {
  const browser = await launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${TEST_URL}iframes`);

  const titles: string[] = [];

  await forEachFrame(context, async ({ frame }) => {
    if (frame.parentFrame()) {
      const element = await frame.frameElement();
      titles.push(await element.getAttribute('title'));
      titles.sort();
    }
  });

  expect(titles).toEqual(['Buttons', 'Text inputs']);
  await page.goto(`${TEST_URL}iframes`);
  await waitFor(() => titles.length === 4);
  expect(titles).toEqual(['Buttons', 'Buttons', 'Text inputs', 'Text inputs']);

  await browser.close();
});

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
