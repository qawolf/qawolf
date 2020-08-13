import { Browser, Page } from 'playwright';
import { addInitScript } from '../../src/utils/context/register';
import { buildSelectorParts } from '../../src/web/selectorEngine';
import { SelectorPart } from '../../src/web/types';
import { launch } from '../../src/utils';
import { TEST_URL } from '../utils';
import { QAWolfWeb } from '../../src/web';

describe('browser tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch();
    const context = await browser.newContext();
    await addInitScript(context);
    page = await context.newPage();
    await page.goto(`${TEST_URL}checkbox-inputs`);
  });

  afterAll(() => browser.close());

  describe('isMatch', () => {
    const isMatch = async (
      selectorParts: SelectorPart[],
      targetSelector: string,
    ): Promise<boolean> => {
      return page.evaluate(
        ({ selectorParts, targetSelector }) => {
          const qawolf: QAWolfWeb = (window as any).qawolf;
          const target = document.querySelector(targetSelector) as HTMLElement;

          return qawolf.isMatch({ selectorParts, target });
        },
        { selectorParts, targetSelector },
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
        '.quote-button',
      );

      expect(result).toBe(true);

      await page.goto(`${TEST_URL}checkbox-inputs`);
    });
  });
});

describe('buildSelectorParts', () => {
  it('builds selector from cues', () => {
    const cues = [
      { level: 0, penalty: 0, type: 'class', value: '.search-input' },
      {
        level: 1,
        penalty: 0,
        type: 'attribute',
        value: '[data-qa="search"]',
      },
      { level: 0, penalty: 0, type: 'tag', value: 'input' },
      { level: 0, penalty: 0, type: 'id', value: '#search' },
    ];

    const selector = buildSelectorParts(cues);

    expect(selector).toEqual([
      { name: 'css', body: '[data-qa="search"]' },
      { name: 'css', body: 'input.search-input#search' },
    ]);
  });

  it('includes text selector if applicable', () => {
    const cues = [
      { level: 1, penalty: 0, type: 'id', value: '#container' },
      {
        level: 0,
        penalty: 0,
        type: 'text',
        value: '"Submit"',
      },
    ];

    const selector = buildSelectorParts(cues);

    expect(selector).toEqual([
      { name: 'css', body: '#container' },
      { name: 'text', body: '"Submit"' },
    ]);
  });

  it('orders selectors based on level', () => {
    const cues = [
      { level: 0, penalty: 0, type: 'id', value: '#search' },
      // check sort is not alphabetical
      { level: 10, penalty: 0, type: 'tag', value: 'nav' },
      { level: 2, penalty: 0, type: 'class', value: '.search-input' },
    ];

    const selector = buildSelectorParts(cues);

    expect(selector).toEqual([
      { name: 'css', body: 'nav' },
      { name: 'css', body: '.search-input' },
      { name: 'css', body: '#search' },
    ]);
  });
});
