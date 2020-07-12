import { Browser, Page } from 'playwright-core';
import { launch } from '../../src/utils';
import { QAWolfWeb } from '../../src/web';
import { webScript } from '../../src/web/addScript';
import { TEST_URL } from '../utils';

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch();
  page = await browser.newPage();
  await page.addInitScript(webScript);
  await page.goto(`${TEST_URL}login`);
});

afterAll(() => browser.close());

describe('nodeToDoc', () => {
  it('serializes tag name and attributes', async () => {
    await page.goto(`${TEST_URL}images`);

    const doc = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('img');
      if (!element) throw new Error('element not found');
      return web.nodeToDoc(element);
    });

    expect(doc).toEqual({
      attrs: {
        alt: 'spirit',
        src: 'logo192.png',
      },
      name: 'img',
    });
  });
});
