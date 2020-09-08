import { Browser, Page } from 'playwright';
import { addInitScript } from '../../src/utils/context/register';
import { launch } from '../../src/utils';
import { QAWolfWeb } from '../../src/web';
import { TEST_URL } from '../utils';

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch();
  const context = await browser.newContext();
  await addInitScript(context);
  page = await context.newPage();
});

afterAll(() => browser.close());

describe('getClickableGroup', () => {
  beforeAll(() => page.goto(`${TEST_URL}buttons`));

  it('returns a clickable group', async () => {
    const group = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('#nested span') as HTMLElement;
      if (!element) throw new Error('element not found');

      return web.getClickableGroup(element).map((el) => el.tagName);
    });

    expect(group).toMatchInlineSnapshot(`
      Array [
        "BUTTON",
        "DIV",
        "SPAN",
      ]
    `);
  });

  it('group has all elements when target is the topmost element in group', async () => {
    const group = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('#nested') as HTMLElement;
      if (!element) throw new Error('element not found');

      return web.getClickableGroup(element).map((el) => el.tagName);
    });

    expect(group).toMatchInlineSnapshot(`
      Array [
        "BUTTON",
        "DIV",
        "SPAN",
      ]
    `);
  });

  it('group has sibling elements and does not have svg descendants', async () => {
    const group = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector(
        '[data-for-test="nested-svg"] > svg > circle',
      ) as HTMLElement;
      if (!element) throw new Error('element not found');

      return web.getClickableGroup(element).map((el) => el.tagName);
    });

    expect(group).toMatchInlineSnapshot(`
      Array [
        "BUTTON",
        "svg",
        "DIV",
        "SPAN",
      ]
    `);
  });

  it('group omits nested button groups', async () => {
    const group = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector(
        '[data-for-test="nested-svg-with-nested-link"]',
      ) as HTMLElement;
      if (!element) throw new Error('element not found');

      return web.getClickableGroup(element).map((el) => el.tagName);
    });

    expect(group).toMatchInlineSnapshot(`
      Array [
        "BUTTON",
        "svg",
        "DIV",
        "SPAN",
      ]
    `);
  });

  it('works on a nested button group', async () => {
    const group = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector(
        '[data-for-test="nested-svg-with-nested-link"] > a > span',
      ) as HTMLElement;
      if (!element) throw new Error('element not found');

      return web.getClickableGroup(element).map((el) => el.tagName);
    });

    expect(group).toMatchInlineSnapshot(`
      Array [
        "A",
        "SPAN",
      ]
    `);
  });

  it('returns empty array if the element is not clickable', async () => {
    const groupLength = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('h3') as HTMLElement;
      if (!element) throw new Error('element not found');

      return web.getClickableGroup(element).length;
    });

    expect(groupLength).toBe(0);
  });
});

describe('getInputElementValue', () => {
  it('gets value from text input', async () => {
    await page.goto(`${TEST_URL}text-inputs`);

    const value = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector(
        '[data-qa="html-text-input"]',
      ) as HTMLInputElement;
      if (!element) throw new Error('element not found');

      element.value = 'I have value';

      return web.getInputElementValue(element);
    });

    expect(value).toEqual('I have value');
  });

  it('gets value from contenteditable element', async () => {
    await page.goto(`${TEST_URL}content-editables`);

    const value = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector(
        '[data-qa="content-editable"]',
      ) as HTMLInputElement;
      if (!element) throw new Error('element not found');

      return web.getInputElementValue(element);
    });

    expect(value).toEqual('Edit me!');
  });

  it('gets value from input element that also has contenteditable attribute', async () => {
    await page.goto(`${TEST_URL}text-inputs`);

    const value = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector(
        '[data-qa="html-text-input-content-editable"]',
      ) as HTMLInputElement;
      if (!element) throw new Error('element not found');

      element.value = 'I have value';

      return web.getInputElementValue(element);
    });

    expect(value).toEqual('I have value');
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
