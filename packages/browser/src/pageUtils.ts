import { logger } from "@qawolf/logger";
import fs from "fs-extra";
import path from "path";
import { Page } from "puppeteer";

const webBundle = fs.readFileSync(
  path.resolve(path.dirname(require.resolve("@qawolf/web")), "./qawolf.web.js"),
  "utf8"
);

export const injectWebBundle = async (page: Page) => {
  await Promise.all([
    page.evaluate(webBundle),
    page.evaluateOnNewDocument(webBundle)
  ]);
};

export const retryExecutionError = async (
  func: () => Promise<any>,
  times: number = 3
): Promise<any> => {
  for (let i = 0; i < times; i++) {
    try {
      return await func();
    } catch (error) {
      if (
        (i < times - 1 &&
          error.message ===
            "Execution context was destroyed, most likely because of a navigation.") ||
        error.message ===
          "Protocol error (Runtime.callFunctionOn): Execution context was destroyed."
      ) {
        logger.verbose(`retry ${i + 1}/${times} error: "${error.message}"`);
        continue;
      }

      logger.error(`will not retry unknown error: "${error.message}"`);
      throw error;
    }
  }
};

export const $xText = async (page: Page, xpath: string): Promise<string> => {
  return await retryExecutionError(async () => {
    const elements = await page.$x(xpath);

    const text = await page.evaluate(
      element => element.textContent,
      elements[0]
    );

    return text;
  });
};
