import { Browser, Page } from 'playwright';
import { launch } from '../../src/utils';
import { QAWolfWeb } from '../../src/web';
import { webScript } from '../../src/web/addScript';
import {
  Cue,
  buildSelectorForCues,
  toSelectorString,
} from '../../src/web/cues';
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

  afterAll(() => browser.close());

  describe('buildAttributeCues', () => {
    const buildAttributeCues = async (
      selector: string,
      attributes: string[],
      level: number,
      useAttributeName = false,
    ): Promise<Cue[]> => {
      return page.evaluate(
        ({ attributes, level, selector, useAttributeName }) => {
          const qawolf: QAWolfWeb = (window as any).qawolf;
          const element = document.querySelector(selector) as HTMLElement;

          return qawolf.buildAttributeCues({
            attributes,
            element,
            level,
            useAttributeName,
          });
        },
        { attributes, level, selector, useAttributeName },
      );
    };

    it('returns attribute cues', async () => {
      const cues = await buildAttributeCues('#single', ['data-qa', 'id'], 1);

      expect(cues).toEqual([
        { level: 1, type: 'attribute', value: '[data-qa="html-checkbox"]' },
        { level: 1, type: 'attribute', value: '[id="single"]' },
      ]);
    });

    it('uses attribute name as cue type if specified', async () => {
      const cues = await buildAttributeCues(
        '#single',
        ['data-qa', 'id'],
        1,
        true,
      );

      expect(cues).toEqual([
        { level: 1, type: 'data-qa', value: '[data-qa="html-checkbox"]' },
        { level: 1, type: 'id', value: '[id="single"]' },
      ]);
    });

    it('returns empty array if element has no specified attributes', async () => {
      const cues = await buildAttributeCues('#single', ['alt', 'title'], 1);

      expect(cues).toEqual([]);
    });
  });
});

describe('buildSelectorForCues', () => {
  it('builds selector from cues', () => {
    const cues = [
      { level: 0, type: 'class' as 'class', value: '.search-input' },

      {
        level: 1,
        type: 'attribute' as 'attribute',
        value: '[data-qa="search"]',
      },
      { level: 0, type: 'tag' as 'tag', value: 'input' },
      { level: 0, type: 'id' as 'id', value: '#search' },
    ];

    const selector = buildSelectorForCues(cues);

    expect(selector).toEqual([
      { name: 'css', body: '[data-qa="search"]' },
      { name: 'css', body: 'input.search-input#search' },
    ]);
  });
});

// describe('isMatch', () => {
//   it('returns false if multiple matches', async () => {
//     const browser = await launch();
//     const page = await browser.newPage();
//     await page.addInitScript(webScript);
//     await page.goto('https://google.com');

//     const isMatch = await page.evaluate(() => {
//       // fix this test
//       return false;
//     });
//     expect(isMatch).toBe(false);

//     await browser.close();
//   });
// });

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
