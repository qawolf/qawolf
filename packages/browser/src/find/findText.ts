import { logger } from "@qawolf/logger";
import { FindOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page } from "puppeteer";

export const findText = async (
  page: Page,
  text: string,
  options: FindOptions
): Promise<ElementHandle<Element> | null> => {
  logger.verbose(`findText: ${text}`);

  const jsHandle = await page.evaluateHandle(
    (text, options) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.find.findText(text, options);
    },
    text,
    options as any
  );

  return jsHandle.asElement();
};
