import { Browser, Page } from 'playwright';
import { launch } from '../../src/utils';
import { QAWolfWeb } from '../../src/web';
import { webScript } from '../../src/web/addScript';
import { TEST_URL } from '../utils';

describe('buildSelector', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch();
    page = await browser.newPage();
    await page.addInitScript(webScript);
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

    const element = await page.$(targetSelector);

    const builtSelector = await page.evaluate(
      ({ element, isClick }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = qawolf.getClickableAncestor(element as HTMLElement);

        return qawolf.buildSelector({
          isClick,
          target,
        });
      },
      { element, isClick },
    );

    expect(builtSelector).toEqual(expectedSelector);
  };

  describe('amazon', () => {
    beforeAll(() => page.goto(`${TEST_URL}fixtures/amazon.html`));

    it.each([
      '#nav-hamburger-menu',
      '[name="field-keywords"]',
      'text="Start here."',
    ])('builds expected selector %o', (selector) => expectSelector(selector));
  });

  describe('todomvc', () => {
    beforeAll(() => page.goto(`${TEST_URL}fixtures/todomvc.html`));

    it.each([
      '[placeholder="What needs to be done?"]',
      '.toggle', // first one is the match
      'li:nth-of-type(2) .toggle',
      'text="Active"',
      'text="Completed"',
    ])('builds expected selector %s', (selector) => expectSelector(selector));
  });

  describe('sandbox', () => {
    it('returns html or body selector for target if applicable', async () => {
      await page.goto(`${TEST_URL}buttons`);
      await page.evaluate(() => {
        document.querySelector('html').setAttribute('data-qa', 'main');
        document.querySelector('body').setAttribute('data-qa', 'container');
      });

      await expectSelector('html');
      await expectSelector('body');
    });

    describe('buttons', () => {
      beforeAll(() => page.goto(`${TEST_URL}buttons`));

      it.each([
        // selects the target
        ['[data-qa="html-button"]'],
        // selects the ancestor
        [['#html-button-child', '[data-qa="html-button-with-children"]']],
        [['.MuiButton-label', '[data-qa="material-button"]']],
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
          [
            '[data-qa="draftjs"] [contenteditable="true"]',
            '[data-qa="draftjs"] [contenteditable="true"]',
            false,
          ],
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

    //   describe('regex attributes', () => {
    //     beforeAll(async () => {
    //       await page.goto(`${TEST_URL}nested-data-attributes`);
    //     });

    //     it('builds selector based of an attribute regex', async () => {
    //       const selector = await buildCssSelector('#button', true, '/^data-.*/');
    //       expect(selector).toBe("[data-test='click'] [data-qa='button']");
    //     });

    //     it('ignores attributes that do not match regex', async () => {
    //       const selector = await buildCssSelector('#button', true, '/^qa-.*/,id');
    //       expect(selector).toBe("[id='button']");

    //       const selector2 = await buildCssSelector('#button', true, '/^qa-.*/');
    //       expect(selector2).toBeUndefined();
    //     });

    //     it('ignores invalid regex', async () => {
    //       const selector = await buildCssSelector(
    //         '#button',
    //         true,
    //         '/[/,/^data-.*/',
    //       );
    //       expect(selector).toBe("[data-test='click'] [data-qa='button']");
    //     });
    //   });
  });
});
