import { CONFIG } from "@qawolf/config";
import { AssertOptions } from "@qawolf/types";
import { QAWolfWeb, waitFor } from "@qawolf/web";
import { Page } from "puppeteer";
import { retryExecutionError } from "./pageUtils";

export const hasText = async (
  page: Page,
  text: string,
  options?: AssertOptions
): Promise<boolean> => {
  const result = await retryExecutionError(async () => {
    const timeoutMs = (options || {}).timeoutMs || CONFIG.findTimeoutMs;

    const pageHasText = await page.evaluate(
      ({ text, timeoutMs }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;

        return qawolf.assertions.hasText(text, { timeoutMs });
      },
      { text, timeoutMs }
    );

    return pageHasText;
  });

  return result;
};

export const getElementProperty = async (
  page: Page,
  selector: string,
  property: string,
  options?: AssertOptions
): Promise<string | null | undefined> => {
  const result = await retryExecutionError(async () => {
    const timeoutMs = (options || {}).timeoutMs || CONFIG.findTimeoutMs;

    const getElementHandleFn = async () => {
      const elementHandles = await page.$$(selector);
      // either no element found or too many matching elements found
      if (elementHandles.length !== 1) return null;

      return elementHandles[0];
    };

    const elementHandle = await waitFor(getElementHandleFn, timeoutMs, 100);
    if (!elementHandle) return null;

    const propertyHandle = await elementHandle.getProperty(property);
    const propertyValue = await propertyHandle.jsonValue();

    return propertyValue;
  });

  return result;
};
