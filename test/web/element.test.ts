import { Browser, Page } from 'playwright-core';
import { addInitScript } from '../../src/utils/context/register';
import { launch } from '../../src/utils';
import { TEST_URL } from '../utils';
import { QAWolfWeb } from '../../src/web';

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch();
  const context = await browser.newContext();
  await addInitScript(context);
  page = await context.newPage();
});

afterAll(() => browser.close());

describe('getClickableAncestor', () => {
  beforeAll(() => page.goto(`${TEST_URL}login`));

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

describe('getTopmostEditableElement', () => {
  beforeAll(() => page.goto(`${TEST_URL}content-editables`));

  it('chooses the topmost isContentEditable ancestor', async () => {
    const xpath = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('.ql-editor > p') as HTMLElement;
      if (!element) throw new Error('element not found');

      const ancestor = web.getTopmostEditableElement(element);
      return web.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='root']/div[3]/div/div/div[2]/div[1]");
  });

  it('chooses the original element when its parent is not isContentEditable', async () => {
    const xpath = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('.ql-editor') as HTMLElement;
      if (!element) throw new Error('element not found');

      const ancestor = web.getTopmostEditableElement(element);
      return web.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='root']/div[3]/div/div/div[2]/div[1]");
  });

  it('chooses the original element when it is not isContentEditable', async () => {
    const xpath = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('[data-qa=quill]') as HTMLElement;
      if (!element) throw new Error('element not found');

      const ancestor = web.getTopmostEditableElement(element);
      return web.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='root']/div[3]/div");
  });
});

describe('getElementText', () => {
  beforeAll(() => page.goto(`${TEST_URL}checkbox-inputs`));

  const getElementText = async (
    selector: string,
  ): Promise<string|null> => {
    return page.evaluate(
      ({ selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.querySelector(selector) as HTMLElement;

        return element ? qawolf.getElementText(element) : 'ELEMENT NOT FOUND';
      },
      { selector },
    );
  };

  it('returns null if no text', async () => {
    const cues = await getElementText('#single');
    expect(cues).toBe(null);
  });

  it('returns null if excessive text', async () => {
    const cues = await getElementText('.container');
    expect(cues).toBe(null);
  });

  it('returns text if applicable', async () => {
    await page.goto(`${TEST_URL}buttons`);

    const cues = await getElementText('#submit-input');

    expect(cues).toBe('Submit Input');
  });

  it('handles quotes in text', async () => {
    const cues = await getElementText('.quote-button');

    expect(cues).toBe('Button "with" extra \'quotes\'');
  });

  it('trims extra whitespace', async () => {
    const cues = await getElementText('#whitespace-button');

    expect(cues).toBe('I have extra whitespace');
  });
});

describe('isVisible', () => {
  beforeAll(() => page.goto(`${TEST_URL}login`));

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
  beforeAll(() => page.goto(`${TEST_URL}login`));

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
