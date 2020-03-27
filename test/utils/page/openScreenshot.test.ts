import { pathExists } from 'fs-extra';
import { Browser, Page } from 'playwright';
import tempy from 'tempy';
import { launch, openScreenshot } from '../../../src/utils';

describe('openScreenshot', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch();
    page = await browser.newPage();
    await page.setContent('<html>im in a screenshot</html>');
  });

  afterAll(() => browser.close());

  it('opens a screenshot', async () => {
    const tempySpy = jest.spyOn(tempy, 'file');

    const process = await openScreenshot(page);

    expect(!!process).toBeTruthy();
    process.kill();

    expect(tempySpy).toHaveBeenCalledTimes(1);

    expect(await pathExists(tempySpy.mock.results[0].value)).toBeTruthy();
  });
});
