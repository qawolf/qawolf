import { CONFIG } from "@qawolf/config";
import { AssertOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
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
