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

    //   describe('type: content editable', () => {
    //     beforeAll(async () => {
    //       await page.goto(`${TEST_URL}content-editables`);
    //     });

    //     it('selects the ancestor and descendant content editable', async () => {
    //       const selector = await buildCssSelector("[data-qa='content-editable']");
    //       expect(selector).toBe("[data-qa='content-editable']");

    //       const selector2 = await buildCssSelector(
    //         "[data-qa='draftjs'] [contenteditable='true']",
    //       );
    //       expect(selector2).toBe("[data-qa='draftjs'] [contenteditable='true']");

    //       const selector3 = await buildCssSelector(
    //         "[data-qa='quill'] [contenteditable='true']",
    //       );
    //       expect(selector3).toBe("[data-qa='quill'] [contenteditable='true']");
    //     });
    //   });

    //   describe('select', () => {
    //     beforeAll(async () => {
    //       await page.goto(`${TEST_URL}selects`);
    //     });

    //     it('selects the target select', async () => {
    //       const selector = await buildCssSelector("[data-qa='html-select']");
    //       expect(selector).toBe("[data-qa='html-select']");
    //     });

    //     it('selects the target and descendant select', async () => {
    //       const selector = await buildCssSelector(
    //         "[data-qa='material-select-native'] select",
    //       );
    //       expect(selector).toBe("[data-qa='material-select-native'] select");
    //     });
    //   });

    //   describe('nested data attributes', () => {
    //     beforeAll(async () => {
    //       await page.goto(`${TEST_URL}nested-data-attributes`);
    //     });

    //     it('includes multiple ancestors in selector if target attribute not unique', async () => {
    //       const selector = await buildCssSelector(
    //         '#button',
    //         true,
    //         'data-qa,data-test',
    //       );
    //       expect(selector).toBe("[data-test='click'] [data-qa='button']");
    //     });

    //     it('includes only target attribute if unique', async () => {
    //       const selector = await buildCssSelector(
    //         '#unique',
    //         true,
    //         'data-qa,data-test',
    //       );
    //       expect(selector).toBe("[data-qa='unique']");
    //     });

    //     it('does not keep crawling if descendant selector unique', async () => {
    //       const selector = await buildCssSelector(
    //         '#dog-0',
    //         true,
    //         'data-qa,data-test',
    //       );
    //       expect(selector).toBe("[data-qa='radio-group'] [value='dog-0']");
    //     });
    //   });

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

    //   describe('html and body elements', () => {
    //     beforeAll(async () => {
    //       await page.goto(`${TEST_URL}buttons`);
    //     });

    //     it('builds selector for html', async () => {
    //       const selector = await buildCssSelector('html', true, '');
    //       expect(selector).toBe('html');
    //     });

    //     it('builds selector for body', async () => {
    //       const selector = await buildCssSelector('body', true, '');
    //       expect(selector).toBe('body');
    //     });

    //     it('returns attribute selector over tag selector', async () => {
    //       await page.evaluate(() => {
    //         document.querySelector('html').setAttribute('data-qa', 'main');
    //         document.querySelector('body').setAttribute('data-qa', 'container');
    //       });

    //       const selector = await buildCssSelector('html', true, 'data-qa');
    //       expect(selector).toBe("[data-qa='main']");

    //       const selector2 = await buildCssSelector('body', true, 'data-qa');
    //       expect(selector2).toBe("[data-qa='container']");
    //     });
    //   });
    // });
  });
});
