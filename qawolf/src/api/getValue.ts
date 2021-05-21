import { Frame, Page } from "playwright";

export interface GetValueOptions {
  timeout?: number;
}

export const getValue = async (
  pageOrFrame: Page | Frame,
  selector: string,
  options?: GetValueOptions
): Promise<boolean | string> => {
  try {
    const element = await pageOrFrame.waitForSelector(selector, options);

    return pageOrFrame.evaluate((element) => {
      if (element.tagName.toLowerCase() === "select") {
        const select = element as HTMLSelectElement;
        return select.options[select.selectedIndex].value;
      }

      if (element.getAttribute("type") === "checkbox") {
        return (element as HTMLInputElement).checked;
      }

      if (element.hasAttribute("value")) {
        return element.getAttribute("value");
      }

      return (element as HTMLElement).innerText || "";
    }, element);
  } catch (error) {
    if (error.message.includes("waitForSelector: Timeout")) {
      throw new Error(`getValue: "${selector}" not found`);
    }

    throw error;
  }
};
