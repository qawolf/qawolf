import { Frame, Page } from "playwright";

export interface AssertElementOptions {
  timeout?: number;
}

export interface AssertTextOptions {
  selector?: string;
  timeout?: number;
}

export const assertElement = async (
  pageOrFrame: Page | Frame,
  selector: string,
  options?: AssertElementOptions
): Promise<void> => {
  try {
    await pageOrFrame.waitForSelector(selector, options);
  } catch (error) {
    throw error;
  }
};

export const assertText = async (
  pageOrFrame: Page | Frame,
  text: string,
  options: AssertTextOptions = {}
): Promise<void> => {
  const selector = options.selector || "body";
  const timeout = (options || {}).timeout || 30000;

  try {
    const element = await pageOrFrame.waitForSelector(selector, { timeout });

    await pageOrFrame.waitForFunction(
      ({ element, text }): boolean => {
        let elementText =
          (element as HTMLInputElement).value ||
          (element as HTMLElement).innerText ||
          "";

        if (element.tagName.toLowerCase() === "select") {
          const select = element as HTMLSelectElement;
          elementText = select.options[select.selectedIndex]?.text || "";
        }

        return elementText.includes(text);
      },
      { element, text },
      { polling: 100, timeout }
    );
  } catch (error) {
    if (
      error.message.includes("waitForFunction: Timeout") ||
      error.message.includes("waitForSelector: Timeout")
    ) {
      throw new Error(`assertText: "${text}" not found in "${selector}"`);
    }

    throw error;
  }
};
