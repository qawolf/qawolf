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

describe('nodeToHtml', () => {
  it('serializes image alt and src', async () => {
    await page.goto(`${TEST_URL}images`);

    const html = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('img');
      if (!element) throw new Error('element not found');

      return web.nodeToHtml(element);
    });

    expect(html).toEqual('<img alt="spirit" src="logo192.png" />');
  });

  it('serializes labels', async () => {
    await page.goto(`${TEST_URL}login`);

    const html = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;

      const element = document.querySelector('input');
      if (!element) throw new Error('element not found');

      return web.nodeToHtml(element);
    });

    expect(html).toEqual(
      '<input autocomplete="off" id="username" type="text" value="" qaw_labels="Username" />',
    );
  });
});

describe('nodeToHtmlSelector', () => {
  it('serializes ancestors, innertext, and labels', async () => {
    await page.goto(`${TEST_URL}login`);

    const html = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('input');
      if (!element) throw new Error('element not found');

      return web.nodeToHtmlSelector(element, 2);
    });

    expect(html).toEqual(
      '<div id="root" qaw_innertext="To log in, use tomsmith as the username, and SuperSecretPassword! as the password. Username Password Log in"><form qaw_innertext="Username Password Log in"><input autocomplete="off" id="username" type="text" value="" qaw_labels="Username" /></form></div>',
    );
  });
});
