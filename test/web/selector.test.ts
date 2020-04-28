import { Browser, Page } from 'playwright';
import { launch } from '../../src/utils';
import { QAWolfWeb } from '../../src/web';
import { webScript } from '../../src/web/addScript';
import { Selector } from '../../src/web/cues';
import { toSelectorString } from '../../src/web/selector';
import { TEST_URL } from '../utils';

describe('browser tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch({ headless: false, devtools: true });
    page = await browser.newPage();
    await page.addInitScript(webScript);
    await page.goto(`${TEST_URL}checkbox-inputs`);
  });

  afterAll(() => {
    browser.close();
  });

  describe('isMatch', () => {
    const isMatch = async (
      selector: Selector[],
      targetSelector: string,
    ): Promise<boolean> => {
      return page.evaluate(
        ({ selector, targetSelector }) => {
          const qawolf: QAWolfWeb = (window as any).qawolf;
          const target = document.querySelector(targetSelector) as HTMLElement;

          return qawolf.isMatch({ selector, target });
        },
        { selector, targetSelector },
      );
    };

    it('returns true if selector matches element', async () => {
      const result = await isMatch(
        [{ body: '[data-qa="html-checkbox"]', name: 'css' }],
        '#single',
      );
      expect(result).toBe(true);

      const result2 = await isMatch(
        [{ body: 'Single checkbox', name: 'text' }],
        '[for="single"]',
      );
      expect(result2).toBe(true);
    });

    it('return false if selector does not match element', async () => {
      const result = await isMatch([{ body: '#cat', name: 'css' }], '#single');
      expect(result).toBe(false);
    });

    it('handles strange quotes in text selector', async () => {
      await page.goto(`${TEST_URL}buttons`);

      const result = await isMatch(
        [{ body: '"Button \\"with\\" extra \'quotes\'"', name: 'text' }],
        '#quote-button',
      );

      expect(result).toBe(true);

      await page.goto(`${TEST_URL}checkbox-inputs`);
    });
  });
});

describe('toSelectorString', () => {
  it('returns a pure CSS selector if possible', () => {
    const selectorString = toSelectorString([
      { name: 'css', body: '[data-qa="search"]' },
      { name: 'css', body: 'input.search-input' },
    ]);

    expect(selectorString).toBe('[data-qa="search"] input.search-input');
  });

  it('returns a single text selector', () => {
    const selectorString = toSelectorString([
      { name: 'text', body: '"Click Me!"' },
    ]);

    expect(selectorString).toBe('text="Click Me!"');
  });

  it('returns a mixed selector', () => {
    const selectorString = toSelectorString([
      { name: 'css', body: '.container' },
      { name: 'text', body: '"Submit"' },
    ]);

    expect(selectorString).toBe('css=.container >> text="Submit"');
  });
});
