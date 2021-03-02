import { Frame, Page } from "playwright";

export interface AssertElementOptions {
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
    if (error.message.includes("waitForSelector: Timeout")) {
      throw new Error(`assertElement: "${selector}" not found`);
    }

    throw error;
  }
};
