import { Browser, Page } from 'playwright';
import { interceptConsoleLogs, launch } from '../../../src/utils';

describe('interceptConsoleLogs', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch();
  });

  afterAll(() => browser.close());

  it('calls callback on console log', async () => {
    page = await browser.newPage();
    const callback = jest.fn();

    await interceptConsoleLogs(page, callback);

    await page.evaluate(() => console.log('hello'));

    expect(callback).toBeCalledWith('log', 'hello');

    await page.close();
  });
});
