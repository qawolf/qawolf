import { Browser, Page } from 'playwright';
import { assertElementText, launch } from '../../../src/utils';
import { TEST_URL } from '../../utils';

describe('assertElementText', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch();
    page = await browser.newPage();
    await page.goto(`${TEST_URL}buttons`);
  });

  afterAll(() => browser.close());

  it('does not throw an error if element contains text', async () => {
    const testFn = async (): Promise<void> => {
      return assertElementText(page, '#html-button', 'Sign in', {
        timeout: 2000,
      });
    };

    await expect(testFn()).resolves.not.toThrowError();
  });

  it('handles input values in addition to inner text', async () => {
    const testFn = async (): Promise<void> => {
      return assertElementText(page, '#submit-input', 'Submit', {
        timeout: 2000,
      });
    };

    await expect(testFn()).resolves.not.toThrowError();
  });

  it('throws an error if element never appears', async () => {
    const testFn = async (): Promise<void> => {
      return assertElementText(page, '#invalid', 'text', { timeout: 2000 });
    };

    await expect(testFn()).rejects.toThrowError('text "text" not found');
  });

  it('throws an error if element does not contain text', async () => {
    const testFn = async (): Promise<void> => {
      return assertElementText(page, '#html-button', 'other text', {
        timeout: 2000,
      });
    };

    await expect(testFn()).rejects.toThrowError('text "other text" not found');
  });
});
