import { Browser, Page } from 'playwright';
import { launch } from '../../src/utils';
import { AttributeValuePair, deserializeRegex } from '../../src/web/attribute';
import { addInitScript } from '../../src/utils/context/register';
import { TEST_URL } from '../utils';
import { QAWolfWeb } from '../../src/web';

describe('deserializeRegex', () => {
  it('returns regex as is if no flag', () => {
    expect(deserializeRegex('/qa-.*/')).toEqual(new RegExp('qa-.*'));
  });

  it('includes flags if passed', () => {
    expect(deserializeRegex('/qa-.*/i')).toEqual(new RegExp('qa-.*', 'i'));
  });

  it('warns user if invalid regex passed', () => {
    jest.spyOn(console, 'error').mockReturnValue(null);

    expect(deserializeRegex('/[/')).toBeNull();
    expect(console.error).toBeCalledWith(
      'qawolf: invalid regex attribute /[/, skipping this attribute',
    );
  });
});

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

  describe('getAttribute', () => {
    const getAttribute = async (
      selector: string,
      attribute: string,
    ): Promise<AttributeValuePair | null> => {
      return page.evaluate(
        ({ attribute, selector }) => {
          const qawolf: QAWolfWeb = (window as any).qawolf;
          const element = document.querySelector(selector) as HTMLElement;

          return qawolf.getAttribute({ attribute, element });
        },
        { attribute, selector },
      );
    };

    it('returns regex attribute', async () => {
      const attribute = await getAttribute('#cat', '/^qa-.*/');

      expect(attribute).toEqual({ name: 'qa-input', value: 'cat' });
    });

    it('returns attribute if present', async () => {
      const attribute = await getAttribute('#single', 'data-qa');

      expect(attribute).toEqual({ name: 'data-qa', value: 'html-checkbox' });
    });

    it('returns null if element does not have attribute', async () => {
      const attribute = await getAttribute('#single', 'title');

      expect(attribute).toBeNull();
    });
  });

  describe('getRegexAttribute', () => {
    const getRegexAttribute = async (
      selector: string,
      regexString: string,
    ): Promise<AttributeValuePair | null> => {
      return page.evaluate(
        ({ selector, regexString }) => {
          const qawolf: QAWolfWeb = (window as any).qawolf;
          const element = document.querySelector(selector) as HTMLElement;

          return qawolf.getRegexAttribute({ element, regexString });
        },
        { selector, regexString },
      );
    };

    it('returns matching attribute and value if possible', async () => {
      const regexAttribute = await getRegexAttribute('#cat', '/^qa-.*/');

      expect(regexAttribute).toEqual({ name: 'qa-input', value: 'cat' });
    });

    it('returns null if no attribute matches regex', async () => {
      const regexAttribute = await getRegexAttribute('#single', '/^qa-.*/');

      expect(regexAttribute).toBeNull();
    });
  });
});
