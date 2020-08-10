import { Browser, Page } from 'playwright-core';
import { addInitScript } from '../../src/utils/context/register';
import { SelectorPart } from '../../src/web/types';
import { QAWolfWeb } from '../../src/web';
import { launch } from '../../src/utils';
import { TEST_URL } from '../utils';

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

describe('toSelector', () => {
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
