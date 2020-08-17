import { Page } from 'playwright';
import { DEFAULT_TIMEOUT } from './scroll';

export interface AssertTextOptions {
  timeout?: number;
}

export const assertElementText = async (
  page: Page,
  selector: string,
  text: string,
  { timeout }: AssertTextOptions,
): Promise<void> => {
  try {
    await page.waitForFunction(
      ({ selector, text }): boolean => {
        const element = document.querySelector(selector);
        if (!element) return false;

        return (element as HTMLElement).innerText.includes(text);
      },
      { selector, text },
      { polling: 100, timeout: timeout || DEFAULT_TIMEOUT },
    );
  } catch (error) {
    throw new Error(
      `assertElementText: text ${text} not found in element ${selector}`,
    );
  }
};
