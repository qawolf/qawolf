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

describe('getClickableAncestor', () => {
  beforeAll(() => page.goto(`${TEST_URL}buttons`));

  it('chooses the top most clickable ancestor', async () => {
    const id = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('#nested span') as HTMLElement;
      if (!element) throw new Error('element not found');

      const ancestor = web.getClickableAncestor(element, []);
      return ancestor.id;
    });

    expect(id).toEqual('nested');
  });

  it('chooses the original element when there is no clickable ancestor', async () => {
    const id = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('#nested') as HTMLElement;
      if (!element) throw new Error('element not found');

      const ancestor = web.getClickableAncestor(element, []);
      return ancestor.id;
    });

    expect(id).toEqual('nested');
  });

  it('stops at an ancestor with a preferred attribute', async () => {
    const attribute = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;

      const element = document.querySelector(
        '[data-qa="nested-attribute"] span',
      ) as HTMLElement;
      if (!element) throw new Error('element not found');

      const ancestor = web.getClickableAncestor(element, ['data-qa']);
      return ancestor.getAttribute('data-qa');
    });

    expect(attribute).toEqual('nested-attribute');
  });
});

describe('getInputElementValue', () => {
  it('gets value from text input', async () => {
    await page.goto(`${TEST_URL}text-inputs`);

    const value = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('[data-qa="html-text-input"]') as HTMLInputElement;
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
      const element = document.querySelector('[data-qa="content-editable"]') as HTMLInputElement;
      if (!element) throw new Error('element not found');

      return web.getInputElementValue(element);
    });

    expect(value).toEqual('Edit me!');
  });

  it('gets value from input element that also has contenteditable attribute', async () => {
    await page.goto(`${TEST_URL}text-inputs`);

    const value = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector('[data-qa="html-text-input-content-editable"]') as HTMLInputElement;
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
