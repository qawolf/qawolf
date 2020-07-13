import { Browser, Page } from 'playwright';
import { addInitScript } from '../../src/utils/context/register';
import { launch } from '../../src/utils';
import { TEST_URL } from '../utils';
import { QAWolfWeb } from '../../src/web';

describe('buildSelector', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch();
    const context = await browser.newContext();
    await addInitScript(context);
    page = await context.newPage();
  });

  afterAll(() => browser.close());

  const expectSelector = async (
    options: string | (string | boolean)[],
  ): Promise<void> => {
    const isArray = Array.isArray(options);

    // [target selector, expected selector, isClick]
    const targetSelector = (isArray ? options[0] : options) as string;
    const expectedSelector = (isArray ? options[1] : options) as string;
    const isClick = typeof options[2] === 'boolean' ? options[2] : true;
    const attribute = typeof options[3] === 'string' ? options[3] : undefined;

    const element = await page.$(targetSelector);

    const builtSelector = await page.evaluate(
      ({ attribute, element, isClick }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = qawolf.getClickableAncestor(element as HTMLElement);

        return qawolf.buildSelector({
          attribute,
          isClick,
          target,
        });
      },
      { attribute, element, isClick },
    );

    expect(builtSelector).toEqual(expectedSelector);
  };

  describe('amazon', () => {
    beforeAll(() => page.goto(`${TEST_URL}fixtures/amazon.html`));

    it.each([
      '#nav-hamburger-menu',
      '[name="field-keywords"]',
      'text=Start here.',
    ])('builds expected selector %o', (selector) => expectSelector(selector));
  });

  describe('todomvc', () => {
    beforeAll(() => page.goto(`${TEST_URL}fixtures/todomvc.html`));

    it.each([
      '[placeholder="What needs to be done?"]',
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
        // selects the ancestor
        [['#html-button-child', '[data-qa="html-button-with-children"]']],
        [['.MuiButton-label', '[data-qa="material-button"]']],
        [['.quote-button', `text=Button "with" extra 'quotes'`]],
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
            '[data-qa="material-text-input"] .MuiInputBase-input',
            false,
          ],
        ],
        [
          [
            '[data-qa="material-textarea"] textarea',
            '[data-qa="material-textarea"] .MuiInputBase-input',
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
            '[data-qa="draftjs"] [contenteditable="true"]',
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
        [['#button', 'text=Click me!', true, '/^qa-.*/']],
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
