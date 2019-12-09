import { FindOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { Page } from "puppeteer";
import { getFindOptions } from "./getFindOptions";

export const hasText = async (
  page: Page,
  text: string,
  options: FindOptions = {}
): Promise<boolean> => {
  const findOptions = getFindOptions(options);

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
