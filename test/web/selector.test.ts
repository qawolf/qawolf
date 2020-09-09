import { Browser, Page } from 'playwright';
import { DEFAULT_ATTRIBUTE_LIST } from '../../src/web/attribute';
import { addInitScript } from '../../src/utils/context/register';
import { SelectorPart } from '../../src/web/types';
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

describe('buildSelector', () => {
  const expectSelector = async (
    options: string | (string | boolean)[],
  ): Promise<void> => {
    const isArray = Array.isArray(options);

    // [target selector, expected selector, isClick, attribute]
    const targetSelector = (isArray ? options[0] : options) as string;
    const expectedSelector = (isArray ? options[1] : options) as string;
    const isClick = typeof options[2] === 'boolean' ? options[2] : true;
    const attributes =
      typeof options[3] === 'string'
        ? options[3].split(',')
        : DEFAULT_ATTRIBUTE_LIST.split(',');

    const element = await page.$(targetSelector);

    const builtSelector = await page.evaluate(
      ({ attributes, element, isClick }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;

        const target = qawolf.getTopmostEditableElement(element as HTMLElement);

        qawolf.clearSelectorCache();

        return qawolf.buildSelector({
          attributes,
          isClick,
          target,
        });
      },
      { attributes, element, isClick },
    );

    expect(builtSelector).toEqual(expectedSelector);
  };

  describe('amazon', () => {
    beforeAll(() => page.goto(`${TEST_URL}fixtures/amazon.html`));

    it.each([
      '[name="field-keywords"]',
      'text="Start here."',
    ])('builds expected selector %o', (selector) => expectSelector(selector));
  });

  describe('todomvc', () => {
    beforeAll(() => page.goto(`${TEST_URL}fixtures/todomvc.html`));

    it.each([
      '.new-todo',
      '.toggle', // first one is the match
      'li:nth-of-type(2) .toggle',
      'text=Active',
      'text=Completed',
    ])('builds expected selector %s', (selector) => expectSelector(selector));
  });

  describe('sandbox', () => {
    describe('html and body', () => {
      beforeAll(async () => {
        await page.goto(`${TEST_URL}buttons`);
        await page.evaluate(() => {
          document.querySelector('html').setAttribute('data-qa', 'main');
          document.querySelector('body').setAttribute('data-qa', 'container');
        });

        it.each(['html', 'body'])('builds expected selector %o', (selector) =>
          expectSelector(selector),
        );
      });
    });

    describe('buttons', () => {
      beforeAll(() => page.goto(`${TEST_URL}buttons`));

      it.each([
        // selects the target
        [['[data-qa="html-button"]', '[data-qa="html-button"]']],
        [['.quote-button', `.quote-button`]],
        // selects the ancestor
        [['#html-button-child', '[data-qa="html-button-with-children"]']],
        [['.MuiButton-label', '[data-qa="material-button"]']],
        ['.second-half.type-two'],
        // selects the better selector for target despite having clickable ancestors
        [['[data-for-test="selection"]', 'text="Better attribute on span"']],
      ])('builds expected selector %o', (selector) => expectSelector(selector));
    });

    describe('date pickers', () => {
      beforeAll(() => page.goto(`${TEST_URL}date-pickers`));

      it.each([
        // selects the ancestor and clickable descendant
        [
          [
            '[data-qa="material-date-picker"] path',
            '[data-qa="material-date-picker"] [aria-label="change date"]',
          ],
        ],
      ])('builds expected selector %o', (selector) => expectSelector(selector));
    });

    describe('click: radio', () => {
      beforeAll(() => page.goto(`${TEST_URL}radio-inputs`));

      it.each([
        [['#single', '[data-qa="html-radio"]']],
        [['.MuiFormControlLabel-label', '[data-qa="material-radio"]']],
        // ancestor group and descendant
        [['#dog', '[data-qa="html-radio-group"] #dog']],
        [['#blue', '[data-qa="material-radio-group"] #blue']],
      ])('builds expected selector %o', (selector) => expectSelector(selector));
    });

    describe('click: checkbox', () => {
      beforeAll(() => page.goto(`${TEST_URL}checkbox-inputs`));

      it.each([
        // target checkbox/label
        [['#single', '[data-qa="html-checkbox"]']],
        [['.MuiFormControlLabel-label', '[data-qa="material-checkbox"]']],
        // ancestor group and descendant
        [['#dog', '[data-qa="html-checkbox-group"] #dog']],
        [['#blue', '[data-qa="material-checkbox-group"] #blue']],
        // special characters
        [['.special\\:class', '#special\\:id']],
      ])('builds expected selector %o', (selector) => expectSelector(selector));
    });

    describe('type: input', () => {
      beforeAll(() => page.goto(`${TEST_URL}text-inputs`));

      it.each([
        // target input/textarea
        [['[type="password"]', '[data-qa="html-password-input"]', false]],
        [['textarea', '[data-qa="html-textarea"]', false]],
        // ancestor and descendant
        [
          [
            '[data-qa="material-text-input"] input',
            '[data-qa="material-text-input"] .MuiInput-input',
            false,
          ],
        ],
        [
          [
            '[data-qa="material-textarea"] textarea',
            '[data-qa="material-textarea"] .MuiInput-input',
            false,
          ],
        ],
      ])('builds expected selector %o', (selector) => expectSelector(selector));
    });

    describe('type: content editable', () => {
      beforeAll(() => page.goto(`${TEST_URL}content-editables`));

      it.each([
        [
          [
            '[data-qa="content-editable"]',
            '[data-qa="content-editable"]',
            false,
          ],
        ],
        [
          [
            '[data-qa="draftjs"] [contenteditable="true"]',
            '[data-qa="draftjs"] .public-DraftEditor-content',
            false,
          ],
        ],
        [
          [
            '[data-qa="quill"] [contenteditable="true"]',
            '[data-qa="quill"] [contenteditable="true"]',
            false,
          ],
        ],
      ])('builds expected selector %o', (selector) => expectSelector(selector));
    });

    describe('select', () => {
      beforeAll(() => page.goto(`${TEST_URL}selects`));

      it.each([
        [['[data-qa="html-select"]', '[data-qa="html-select"]']],
        // target and descendant
        [
          [
            '[data-qa="material-select-native"] select',
            '[data-qa="material-select-native"] #material-select-native',
          ],
          // check the invisible text is not targeted
          [
            '[data-qa="material-select"] #material-select',
            '[data-qa="material-select"] #material-select',
          ],
        ],
      ])('builds expected selector %o', (selector) => expectSelector(selector));
    });

    describe('nested data attributes', () => {
      beforeAll(() => page.goto(`${TEST_URL}nested-data-attributes`));

      it.each([
        // multiple ancestors
        [['#button', '[data-test="click"] [data-qa="button"]']],
        // unique selectors
        [['#unique', '[data-qa="unique"]']],
        [['#dog-0', '[data-qa="radio-group"] [value="dog-0"]']],
      ])('builds expected selector %o', (selector) => expectSelector(selector));
    });

    describe('regex attributes', () => {
      beforeAll(() => page.goto(`${TEST_URL}nested-data-attributes`));

      it.each([
        [
          [
            '#button',
            '[data-test="click"] [data-qa="button"]',
            true,
            '/^data-.*/',
          ],
        ],
        // ignore non-matching attributes
        [['#button', '#button', true, '/^qa-.*/']],
        // ignore invalid regex
        [
          [
            '#button',
            '[data-test="click"] [data-qa="button"]',
            true,
            '/[/,/^data-.*/',
          ],
        ],
      ])('builds expected selector %o', (selector) => expectSelector(selector));
    });
  });
});

describe('toSelector', () => {
  beforeAll(async () => {
    await page.goto(`${TEST_URL}checkbox-inputs`);
  });

  const toSelector = async (selectorParts: SelectorPart[]): Promise<string> => {
    return page.evaluate(
      ({ selectorParts }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        return qawolf.toSelector(selectorParts);
      },
      { selectorParts },
    );
  };

  it('returns a pure CSS selector if possible', async () => {
    const selectorString = await toSelector([
      { name: 'css', body: '[data-qa="search"]' },
      { name: 'css', body: 'input.search-input' },
    ]);

    expect(selectorString).toBe('[data-qa="search"] input.search-input');
  });

  it('returns a single text selector', async () => {
    const selectorString = await toSelector([
      { name: 'text', body: '"Click Me!"' },
    ]);

    expect(selectorString).toBe('text="Click Me!"');
  });

  it('returns a mixed selector', async () => {
    const selectorString = await toSelector([
      { name: 'css', body: '.container' },
      { name: 'text', body: '"Submit"' },
    ]);

    expect(selectorString).toBe('css=.container >> text="Submit"');
  });
});
