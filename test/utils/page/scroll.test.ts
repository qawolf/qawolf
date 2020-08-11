import { Browser, Page } from 'playwright';
import { launch, scroll } from '../../../src/utils';
import { getScrollValue } from '../../../src/utils/page/scroll';
import { TEST_URL } from '../../utils';

describe('scroll', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch();
    page = await browser.newPage();
  });

  afterAll(() => browser.close());

  it('scrolls element to specified position if possible', async () => {
    await page.goto(`${TEST_URL}large`);

    await scroll(page, 'html', { x: 0, y: 200 });

    const elementHandle = await page.waitForSelector('html');
    expect(await getScrollValue(page, elementHandle)).toEqual({ x: 0, y: 200 });
  });

  it('handles infinite scroll', async () => {
    await page.goto(`${TEST_URL}infinite-scroll`);

    await scroll(page, 'html', { x: 0, y: 2000 });

    const elementHandle = await page.waitForSelector('html');
    expect(await getScrollValue(page, elementHandle)).toEqual({
      x: 0,
      y: 2000,
    });
  });

  it('does not throw error if can partially scroll element', async () => {
    await page.goto(`${TEST_URL}large`);

    await scroll(page, 'html', { x: 0, y: 2000, timeout: 1000 });

    const elementHandle = await page.waitForSelector('html');
    const result = await getScrollValue(page, elementHandle);

    expect(result.x).toBe(0);
    expect(result.y).toBeLessThan(1600);
  });

  it('throws error if cannot scroll element at all', async () => {
    await page.goto(`${TEST_URL}infinite-scroll`);

    const testFn = (): Promise<void> =>
      scroll(page, 'html', { x: 200, y: 0, timeout: 1000 });

    await expect(testFn()).rejects.toThrow('could not scroll element html');
  });
});
