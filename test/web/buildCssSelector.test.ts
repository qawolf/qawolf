import { Browser, Page } from 'playwright-core';
import { launch } from 'playwright-utils';
import { QAWolfWeb } from '../../src/web';
import { WEB_SCRIPT } from '../../src/web/addScript';
import {
  AttributeValuePair,
  deserializeRegex,
} from '../../src/web/buildCssSelector';
import { TEST_URL } from '../utils';

let browser: Browser;
let page: Page;

const buildCssSelector = async (
  selector: string,
  isClick = false,
  attribute = 'data-qa',
): Promise<string | undefined> => {
  const result = await page.evaluate(
    (selector, isClick, attribute) => {
      const web: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector(selector) as HTMLElement;

      return web.buildCssSelector({
        target,
        attribute,
        isClick,
      });
    },
    selector,
    isClick,
    attribute,
  );

  return result;
};

const getAttributeValue = async (
  selector: string,
  attribute: string,
): Promise<AttributeValuePair | null> => {
  const result = await page.evaluate(
    (selector, attribute) => {
      const web: QAWolfWeb = (window as any).qawolf;
      const button = document.querySelector(selector) as HTMLElement;
      return web.getAttributeValue(button, attribute);
    },
    selector,
    attribute,
  );

  return result;
};

beforeAll(async () => {
  browser = await launch();
  page = await browser.newPage();
  await page.addInitScript(WEB_SCRIPT);
});

afterAll(async () => {
  await browser.close();
  jest.restoreAllMocks();
});

describe('buildCssSelector', () => {
  it('returns undefined if there is no attribute', async () => {
    await page.goto(`${TEST_URL}buttons`);

    const selector = await buildCssSelector('#html-button', true);
    expect(selector).toBeUndefined();
  });

  describe('click: button', () => {
    beforeAll(async () => {
      await page.goto(`${TEST_URL}buttons`);
    });

    it('selects the target', async () => {
      const selector = await buildCssSelector("[data-qa='html-button']", true);
      expect(selector).toBe("[data-qa='html-button']");
    });

    it('selects the ancestor', async () => {
      const selector = await buildCssSelector('#html-button-child', true);
      expect(selector).toBe("[data-qa='html-button-with-children']");

      const selector2 = await buildCssSelector('.MuiButton-label', true);
      expect(selector2).toBe("[data-qa='material-button']");
    });
  });

  describe('click: date picker button', () => {
    it('selects the ancestor and clickable descendant', async () => {
      await page.goto(`${TEST_URL}date-pickers`);

      const selector = await buildCssSelector(
        '[data-qa="material-date-picker"] path',
        true,
      );
      expect(selector).toBe("[data-qa='material-date-picker'] button");
    });
  });

  describe('click: radio', () => {
    beforeAll(async () => {
      await page.goto(`${TEST_URL}radio-inputs`);
    });

    it('selects the target radio button/label', async () => {
      const selector = await buildCssSelector('#single', true);
      expect(selector).toBe("[data-qa='html-radio']");

      const selector2 = await buildCssSelector(
        '.MuiFormControlLabel-label',
        true,
      );
      expect(selector2).toBe("[data-qa='material-radio']");
    });

    it('selects the ancestor group and descendant value', async () => {
      const selector = await buildCssSelector('#dog', true);
      expect(selector).toBe("[data-qa='html-radio-group'] [value='dog']");

      const selector2 = await buildCssSelector('#blue', true);
      expect(selector2).toBe("[data-qa='material-radio-group'] [value='blue']");
    });
  });

  describe('click: checkbox', () => {
    beforeAll(async () => {
      await page.goto(`${TEST_URL}checkbox-inputs`);
    });

    it('selects the target checkbox/label', async () => {
      const selector = await buildCssSelector('#single', true);
      expect(selector).toBe("[data-qa='html-checkbox']");

      const selector2 = await buildCssSelector(
        '.MuiFormControlLabel-label',
        true,
      );
      expect(selector2).toBe("[data-qa='material-checkbox']");
    });

    it('selects the ancestor group and descendant value', async () => {
      const selector = await buildCssSelector('#dog', true);
      expect(selector).toBe("[data-qa='html-checkbox-group'] [value='dog']");

      const selector2 = await buildCssSelector('#blue', true);
      expect(selector2).toBe(
        "[data-qa='material-checkbox-group'] [value='blue']",
      );
    });
  });

  describe('type: input', () => {
    beforeAll(async () => {
      await page.goto(`${TEST_URL}text-inputs`);
    });

    it('select the target input/textarea', async () => {
      const selector = await buildCssSelector('[type="password"]');
      expect(selector).toBe("[data-qa='html-password-input']");

      const selector2 = await buildCssSelector('textarea');
      expect(selector2).toBe("[data-qa='html-textarea']");
    });

    it('selects the ancestor and descendant input/textarea', async () => {
      const selector = await buildCssSelector(
        '[data-qa="material-text-input"] input',
      );
      expect(selector).toBe("[data-qa='material-text-input'] input");

      const selector2 = await buildCssSelector(
        "[data-qa='material-textarea'] textarea",
      );
      expect(selector2).toBe("[data-qa='material-textarea'] textarea");
    });
  });

  describe('type: content editable', () => {
    beforeAll(async () => {
      await page.goto(`${TEST_URL}content-editables`);
    });

    it('selects the ancestor and descendant content editable', async () => {
      const selector = await buildCssSelector("[data-qa='content-editable']");
      expect(selector).toBe("[data-qa='content-editable']");

      const selector2 = await buildCssSelector(
        "[data-qa='draftjs'] [contenteditable='true']",
      );
      expect(selector2).toBe("[data-qa='draftjs'] [contenteditable='true']");

      const selector3 = await buildCssSelector(
        "[data-qa='quill'] [contenteditable='true']",
      );
      expect(selector3).toBe("[data-qa='quill'] [contenteditable='true']");
    });
  });

  describe('select', () => {
    beforeAll(async () => {
      await page.goto(`${TEST_URL}selects`);
    });

    it('selects the target select', async () => {
      const selector = await buildCssSelector("[data-qa='html-select']");
      expect(selector).toBe("[data-qa='html-select']");
    });

    it('selects the target and descendant select', async () => {
      const selector = await buildCssSelector(
        "[data-qa='material-select-native'] select",
      );
      expect(selector).toBe("[data-qa='material-select-native'] select");
    });
  });

  describe('nested data attributes', () => {
    beforeAll(async () => {
      await page.goto(`${TEST_URL}nested-data-attributes`);
    });

    it('includes multiple ancestors in selector if target attribute not unique', async () => {
      const selector = await buildCssSelector(
        '#button',
        true,
        'data-qa,data-test',
      );
      expect(selector).toBe("[data-test='click'] [data-qa='button']");
    });

    it('includes only target attribute if unique', async () => {
      const selector = await buildCssSelector(
        '#unique',
        true,
        'data-qa,data-test',
      );
      expect(selector).toBe("[data-qa='unique']");
    });

    it('does not keep crawling if descendant selector unique', async () => {
      const selector = await buildCssSelector(
        '#dog-0',
        true,
        'data-qa,data-test',
      );
      expect(selector).toBe("[data-qa='radio-group'] [value='dog-0']");
    });
  });

  describe('regex attributes', () => {
    beforeAll(async () => {
      await page.goto(`${TEST_URL}nested-data-attributes`);
    });

    it('builds selector based of an attribute regex', async () => {
      const selector = await buildCssSelector('#button', true, '/data-.*/');
      expect(selector).toBe("[data-test='click'] [data-qa='button']");
    });

    it('ignores attributes that do not match regex', async () => {
      const selector = await buildCssSelector('#button', true, '/qa-.*/,id');
      expect(selector).toBe("[id='button']");

      const selector2 = await buildCssSelector('#button', true, '/qa-.*/');
      expect(selector2).toBeUndefined();
    });

    it('ignores invalid regex', async () => {
      const selector = await buildCssSelector('#button', true, '/[/,/data-.*/');
      expect(selector).toBe("[data-test='click'] [data-qa='button']");
    });
  });
});

describe('deserializeRegex', () => {
  it('returns regex as is if no flag', () => {
    expect(deserializeRegex('/qa-.*/')).toEqual(new RegExp('qa-.*'));
  });

  it('includes flags if passed', () => {
    expect(deserializeRegex('/qa-.*/i')).toEqual(new RegExp('qa-.*', 'i'));
  });

  it('warns user if invalid regex passed', () => {
    jest.spyOn(console, 'error').mockReturnValue(null);

    expect(deserializeRegex('/[/')).toBeNull();
    expect(console.error).toBeCalledWith(
      'qawolf: invalid regex attribute /[/, skipping this attribute',
    );
  });
});

describe('getAttributeValue', () => {
  beforeAll(async () => {
    await page.goto(`${TEST_URL}buttons`);
  });

  it('returns null if attribute not specified', async () => {
    const attribute = await getAttributeValue('#html-button', '');
    expect(attribute).toBeNull();
  });

  it('returns null if element does not have specified attribute', async () => {
    const attribute = await getAttributeValue('#html-button', 'data-qa');
    expect(attribute).toBeNull();
  });

  it('returns attribute when there is one specified', async () => {
    const attribute = await getAttributeValue(
      "[data-qa='html-button']",
      'data-qa',
    );
    expect(attribute).toEqual({ attribute: 'data-qa', value: 'html-button' });
  });

  it('returns attribute when there are multiple specified', async () => {
    const attribute = await getAttributeValue(
      "[data-qa='html-button']",
      'data-qa,data-test',
    );
    expect(attribute).toEqual({ attribute: 'data-qa', value: 'html-button' });
  });

  it('ignores whitespace in the attribute', async () => {
    const attribute = await getAttributeValue('#html-button', ' id ');
    expect(attribute).toEqual({ attribute: 'id', value: 'html-button' });

    const attribute2 = await getAttributeValue('#html-button', 'data-qa, id ');
    expect(attribute2).toEqual({ attribute: 'id', value: 'html-button' });
  });
});
