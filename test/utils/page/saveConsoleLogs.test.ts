import { readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Browser, Page } from 'playwright-core';
import { launch, saveConsoleLogs } from '../../../src/utils';
import { randomString } from '../../utils';

describe('saveConsoleLogs', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch();
    page = await browser.newPage();
  });

  afterAll(() => browser.close());

  it('saves console logs to specified file', async () => {
    const savePath = join(tmpdir(), randomString(), `${Date.now()}.txt`);

    await saveConsoleLogs(page, savePath);

    await page.evaluate(() => console.log('hello'));
    await page.evaluate(() => console.error('demogorgon'));

    const lines = readFileSync(savePath, 'utf8').split('\n');
    expect(lines).toEqual(['log: hello', 'error: demogorgon', '']);
  });
});
