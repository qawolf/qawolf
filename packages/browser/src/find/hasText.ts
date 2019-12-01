import { CONFIG } from "@qawolf/config";
import { isNil, QAWolfWeb, waitFor } from "@qawolf/web";
import { Page } from "puppeteer";
import { retryExecutionError } from "../retry";

export const hasText = async (
  page: Page,
  text: string,
  timeoutMs?: number
): Promise<boolean> => {
  const findTimeoutMs = (isNil(timeoutMs) ? CONFIG.findTimeoutMs : timeoutMs)!;

  const result = await retryExecutionError(async () => {
    const pageHasText = await page.evaluate(
      ({ text, timeoutMs }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;

        return qawolf.find.hasText(text, timeoutMs);
      },
      { text, timeoutMs: findTimeoutMs }
    );

    return pageHasText;
  });

  return result;
};
