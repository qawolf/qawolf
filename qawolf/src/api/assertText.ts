import { Frame, Page } from "playwright";

export interface AssertTextOptions {
  selector?: string;
  timeout?: number;
}

export const assertText = async (
  pageOrFrame: Page | Frame,
  text: string,
  options: AssertTextOptions = {}
): Promise<void> => {
  const selector = options.selector || "body";

  try {
    await pageOrFrame.waitForFunction(
      ({ selector, text }): boolean => {
        const element = document.querySelector(selector) as HTMLElement;
        if (!element) return false;

        const elementText =
          (element as HTMLInputElement).value || element.innerText || "";

        return elementText.includes(text);
      },
      { selector, text },
      { polling: 100, timeout: (options || {}).timeout || 30000 }
    );
  } catch (error) {
    if (error.message.includes("waitForFunction: Timeout")) {
      throw new Error(`assertText: "${text}" not found in "${selector}"`);
    }

    throw error;
  }
};
