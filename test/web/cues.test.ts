import { Browser, Page } from 'playwright';
import { launch } from '../../src/utils';
import { QAWolfWeb } from '../../src/web';
import { buildSelectorParts, Cue } from '../../src/web/cues';
import { addInitScript } from '../../src/utils/context/register';
import { TEST_URL } from '../utils';

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

  describe('buildCues', () => {
    const buildCues = async (selector: string): Promise<Cue[]> => {
      return page.evaluate((selector) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(selector) as HTMLElement;

        return qawolf.buildCues({ isClick: true, target });
      }, selector);
    };

    it('builds cues for a target', async () => {
      const cues = await buildCues('#single');
      expect(cues).toMatchSnapshot();
    });
  });

  describe('buildCuesForElement', () => {
    const buildCuesForElement = async (selector: string): Promise<Cue[]> => {
      return page.evaluate(
        ({ selector }) => {
          const qawolf: QAWolfWeb = (window as any).qawolf;
          const element = document.querySelector(selector) as HTMLElement;

          return qawolf.buildCuesForElement({
            attributes: ['data-qa'],
            element,
            isClick: true,
            level: 1,
          });
        },
        {
          selector,
        },
      );
    };

    it('builds cues for an element', async () => {
      const cues = await buildCuesForElement('#single');
      expect(cues).toEqual([
        { level: 1, type: 'attribute', value: '[data-qa="html-checkbox"]' },
        { level: 1, type: 'id', value: '#single' },
        { level: 1, type: 'tag', value: 'input' },
      ]);

      const cues2 = await buildCuesForElement('[for="single"]');
      expect(cues2).toEqual([
        { level: 1, type: 'for', value: '[for="single"]' },
        { level: 1, type: 'text', value: 'Single checkbox' },
        { level: 1, type: 'tag', value: 'label' },
      ]);
    });
  });

  describe('buildCueValueForTag', () => {
    const buildCueValueForTag = async (selector: string): Promise<string> => {
      return page.evaluate((selector) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.querySelector(selector) as HTMLElement;

        return qawolf.buildCueValueForTag(element);
      }, selector);
    };

    it('returns tag name if no parent element', async () => {
      const value = await buildCueValueForTag('html');
      expect(value).toBe('html');
    });

    it('returns tag name if element has no siblings', async () => {
      const value = await buildCueValueForTag('.container h3');
      expect(value).toBe('h3');
    });

    it('returns tag name if element is first child', async () => {
      const value = await buildCueValueForTag('[for="single"]');
      expect(value).toBe('label');
    });

    it('returns nth-of-type tag if element is a lower sibling', async () => {
      const value = await buildCueValueForTag('[for="another"]');
      expect(value).toBe('label:nth-of-type(2)');
    });
  });

  describe('buildTextCues', () => {
    afterAll(() => page.goto(`${TEST_URL}checkbox-inputs`));

    const buildTextCues = async (
      selector: string,
      level: number,
      isClick: boolean,
    ): Promise<Cue[]> => {
      return page.evaluate(
        ({ isClick, level, selector }) => {
          const qawolf: QAWolfWeb = (window as any).qawolf;
          const element = document.querySelector(selector) as HTMLElement;

          return qawolf.buildTextCues({
            element,
            isClick,
            level,
          });
        },
        { isClick, level, selector },
      );
    };

    it('returns empty array if not a click', async () => {
      const cues = await buildTextCues('#single', 1, false);
      expect(cues).toEqual([]);
    });

    it('returns empty array if no text', async () => {
      const cues = await buildTextCues('#single', 1, true);
      expect(cues).toEqual([]);
    });

    it('returns empty array if excessive text', async () => {
      const cues = await buildTextCues('.container', 1, true);
      expect(cues).toEqual([]);
    });

    it('returns text cue if applicable', async () => {
      await page.goto(`${TEST_URL}buttons`);

      const cues = await buildTextCues('#submit-input', 1, true);

      expect(cues).toEqual([{ level: 1, type: 'text', value: 'Submit Input' }]);
    });

    it('handles quotes in text', async () => {
      const cues = await buildTextCues('.quote-button', 1, true);

      expect(cues).toEqual([
        {
          level: 1,
          type: 'text',
          value: 'Button "with" extra \'quotes\'',
        },
      ]);
    });

    it('trims extra whitespace', async () => {
      const cues = await buildTextCues('#whitespace-button', 1, true);

      expect(cues).toEqual([
        { level: 1, type: 'text', value: 'I have extra whitespace' },
      ]);
    });
  });
});

describe('buildSelectorParts', () => {
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

    const selector = buildSelectorParts(cues);

    expect(selector).toEqual([
      { name: 'css', body: '[data-qa="search"]' },
      { name: 'css', body: 'input.search-input#search' },
    ]);
  });

  it('includes text selector if applicable', () => {
    const cues = [
      { level: 1, type: 'id' as 'id', value: '#container' },
      {
        level: 0,
        type: 'text' as 'text',
        value: '"Submit"',
      },
    ];

    const selector = buildSelectorParts(cues);

    expect(selector).toEqual([
      { name: 'css', body: '#container' },
      { name: 'text', body: '"Submit"' },
    ]);
  });
});
