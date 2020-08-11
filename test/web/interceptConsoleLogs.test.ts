import { Browser, Page } from 'playwright';
import { addInitScript } from '../../src/utils/context/register';
import { launch } from '../../src/utils';
import { TEST_URL } from '../utils';
import { QAWolfWeb } from '../../src/web';

let page: Page;

const formatArgument = (arg: any, isSelector = false): Promise<any> => {
  return page.evaluate(
    ({ arg, isSelector }) => {
      const web: QAWolfWeb = (window as any).qawolf;

      if (isSelector) {
        return web.formatArgument(document.querySelector(arg));
      }
      return web.formatArgument(arg);
    },
    { arg, isSelector },
  );
};

describe('interceptConsoleLogs', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await launch();
    const context = await browser.newContext();
    await addInitScript(context);
    page = await context.newPage();
    await page.goto(TEST_URL);
  });

  afterAll(() => browser.close());

  describe('formatArgument', () => {
    it('returns argument if argument is a string', async () => {
      const result = await formatArgument('Hello!');
      expect(result).toBe('Hello!');
    });

    it('returns xpath of argument if argument is a node', async () => {
      await page.setContent('<button id="button">Submit</button>');

      const result = await formatArgument('#button', true);
      expect(result).toBe("//*[@id='button']");
    });

    it('returns stringified argument if argument is JSON', async () => {
      const result = await formatArgument('{"hello":"world"}');
      expect(result).toBe('{"hello":"world"}');
    });

    it('returns argument as string if possible', async () => {
      const result = await formatArgument(11);
      expect(result).toBe('11');
    });
  });
});
