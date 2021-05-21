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

  return new Promise(async (resolve, reject) => {
    let fulfilled = false;

    const timeoutId = setTimeout(() => {
      if (fulfilled) return;
      fulfilled = true;
      reject(new Error(`assertText: "${text}" not found in "${selector}"`));
    }, timeout);

    while (!fulfilled) {
      try {
        const hasText = await pageOrFrame.$eval(
          selector,
          (element, text) => {
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
          text
        );

        if (hasText && !fulfilled) {
          fulfilled = true;
          clearTimeout(timeoutId);
          resolve();
        }
      } catch (e) {}

      await new Promise((r) => setTimeout(r, 100));
    }
  });
};
