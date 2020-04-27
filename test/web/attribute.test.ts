import { Browser, Page } from 'playwright';
import { launch } from '../../src/utils';
import { QAWolfWeb } from '../../src/web';
import { webScript } from '../../src/web/addScript';
import { AttributeValuePair, deserializeRegex } from '../../src/web/attribute';
import { TEST_URL } from '../utils';

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

describe('getRegexAttribute', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch({ headless: false, devtools: true });
    page = await browser.newPage();
    await page.addInitScript(webScript);
    await page.goto(`${TEST_URL}/checkbox-inputs`);
  });

  afterAll(() => browser.close());

  const getRegexAttribute = async (
    selector: string,
    regexString: string,
  ): Promise<AttributeValuePair> => {
    const element = await page.$(selector);
    console.log('EL', element);
    return page.evaluate(
      ([sel, regex]) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.querySelector(sel) as HTMLElement;

        return qawolf.getRegexAttribute({ element, regexString: regex });
      },
      [selector, regexString],
    );
  };

  it('returns matching attribute and value if possible', async () => {});

  it('returns null if no attribute matches regex', async () => {
    const regexAttribute = await getRegexAttribute('#single', '/^qa-.*/');

    expect(regexAttribute).toBeNull();
  });
});
