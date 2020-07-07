import { Browser, Page } from 'playwright-core';
import { QAWolfWeb } from '../../src/web';
import { webScript } from '../../src/web/addScript';
import { launch } from '../../src/utils';
import { TEST_URL } from '../utils';

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch();
  page = await browser.newPage();
  await page.addInitScript(webScript);
});

afterAll(() => browser.close());

describe('canTargetValue', () => {
  const canTargetValue = async (selector: string): Promise<boolean> => {
    return page.evaluate(
      ({ selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.querySelector(selector) as HTMLElement;
        return qawolf.canTargetValue(element);
      },
      { selector },
    );
  };

  it('allows checkbox inputs', async () => {
    await page.goto(`${TEST_URL}checkbox-inputs`);
    expect(await canTargetValue('[data-qa="html-checkbox"]')).toEqual(true);
  });

  it('allows radio inputs', async () => {
    await page.goto(`${TEST_URL}radio-inputs`);
    expect(await canTargetValue('[data-qa="html-radio"]')).toEqual(true);
  });

  it('disallows text inputs', async () => {
    await page.goto(`${TEST_URL}text-inputs`);
    expect(await canTargetValue('[data-qa="html-text-input"]')).toEqual(false);
    expect(await canTargetValue('[data-qa="html-textarea"]')).toEqual(false);
  });
});

describe('getClickableAncestor', () => {
  beforeAll(async () => {
    await page.goto(`${TEST_URL}login`);
  });

  it('chooses the top most clickable ancestor', async () => {
    const xpath = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.getElementsByTagName('p')[1];
      if (!element) throw new Error('element not found');

      const ancestor = web.getClickableAncestor(element);
      return web.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='root']/form/button");
  });

  it('chooses the original element when there is no clickable ancestor', async () => {
    const xpath = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.getElementsByTagName('button')[0];
      if (!element) throw new Error('element not found');

      const ancestor = web.getClickableAncestor(element);
      return web.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='root']/form/button");
  });
});

describe('isVisible', () => {
  beforeAll(async () => {
    await page.goto(`${TEST_URL}login`);
  });

  it('returns true if element is visible', async () => {
    const isElementVisible = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.getElementById('username');
      if (!element) throw new Error('element not found');

      return web.isVisible(element);
    });

    expect(isElementVisible).toBe(true);
  });

  it('returns false if element has no width', async () => {
    const isElementVisible = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.getElementById('username');
      if (!element) throw new Error('element not found');

      element.style.border = '0';
      element.style.padding = '0';
      element.style.width = '0';

      return web.isVisible(element);
    });

    expect(isElementVisible).toBe(false);
  });

  it('returns false if element is display:none', async () => {
    const isElementVisible = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.getElementById('password');
      if (!element) throw new Error('element not found');

      element.style.display = 'none';

      return web.isVisible(element);
    });

    expect(isElementVisible).toBe(false);
  });
});

describe('isClickable', () => {
  beforeAll(async () => {
    await page.goto(`${TEST_URL}login`);
  });

  it('returns true if element is clickable', async () => {
    const isClickable = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;

      const loginButton = document.getElementsByTagName('button')[0];
      return web.isClickable(loginButton, window.getComputedStyle(loginButton));
    });

    expect(isClickable).toBe(true);
  });

  it('returns false if element is not clickable', async () => {
    const isClickable = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.getElementById('username');
      if (!element) throw new Error('element not found');

      return web.isClickable(element, window.getComputedStyle(element));
    });

    expect(isClickable).toBe(false);
  });
});
