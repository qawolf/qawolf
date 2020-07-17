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

          const cueTypesConfig = qawolf.getCueTypesConfig(['data-qa']);
          return qawolf.buildCuesForElement({
            cueTypesConfig,
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
        { level: 1, penalty: 5, type: 'id', value: '#single' },
        { level: 1, penalty: 40, type: 'tag', value: 'input' },
        { level: 1, penalty: 0, type: 'attribute', value: '[data-qa="html-checkbox"]' },
      ]);

      const cues2 = await buildCuesForElement('[for="single"]');
      expect(cues2).toEqual([
        { level: 1, penalty: 5, type: 'attribute', value: '[for="single"]' },
        { level: 1, penalty: 40, type: 'tag', value: 'label' },
        { level: 1, penalty: 12, type: 'text', value: 'Single checkbox' },
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

  describe('getElementText', () => {
    afterAll(() => page.goto(`${TEST_URL}checkbox-inputs`));

    const getElementText = async (
      selector: string,
    ): Promise<string|null> => {
      return page.evaluate(
        ({ selector }) => {
          const qawolf: QAWolfWeb = (window as any).qawolf;
          const element = document.querySelector(selector) as HTMLElement;

          return qawolf.getElementText(element);
        },
        { selector },
      );
    };

    it('returns null if no text', async () => {
      const cues = await getElementText('#single');
      expect(cues).toBe(null);
    });

    it('returns null if excessive text', async () => {
      const cues = await getElementText('.container');
      expect(cues).toBe(null);
    });

    it('returns text if applicable', async () => {
      await page.goto(`${TEST_URL}buttons`);

      const cues = await getElementText('#submit-input');

      expect(cues).toBe('Submit Input');
    });

    it('handles quotes in text', async () => {
      const cues = await getElementText('.quote-button');

      expect(cues).toBe('Button "with" extra \'quotes\'');
    });

    it('trims extra whitespace', async () => {
      const cues = await getElementText('#whitespace-button');

      expect(cues).toBe('I have extra whitespace');
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
});
