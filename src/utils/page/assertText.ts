import { Page } from 'playwright';
import { DEFAULT_TIMEOUT } from './scroll';

export interface AssertTextOptions {
  timeout?: number;
}

export const assertElementText = async (
  page: Page,
  selector: string,
  text: string,
  options?: AssertTextOptions,
): Promise<void> => {
  try {
    await page.waitForFunction(
      ({ selector, text }): boolean => {
        const element = document.querySelector(selector) as HTMLElement;
        if (!element) return false;

        const elementText =
          (element as HTMLInputElement).value || element.innerText || '';

        return elementText.includes(text);
      },
      { selector, text },
      { polling: 100, timeout: (options || {}).timeout || DEFAULT_TIMEOUT },
    );
  } catch (error) {
    if (error.message.includes('page.waitForFunction: Timeout')) {
      throw new Error(
        `assertElementText: text "${text}" not found in element ${selector}`,
      );
    }

    throw error;
  }
};
