import { FindElementOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { Page } from "puppeteer";
import { getFindElementOptions } from "./getFindElementOptions";

export const hasText = async (
  page: Page,
  text: string,
  options: FindElementOptions = {}
): Promise<boolean> => {
  const findOptions = getFindElementOptions(options);

  const result = await page.evaluate(
    (text, timeoutMs) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.find.hasText(text, timeoutMs);
    },
    text,
    findOptions.timeoutMs || 0
  );

  return result;
};
