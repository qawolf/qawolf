import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { FindOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page } from "puppeteer";

export const findCss = async (
  page: Page,
  cssSelector: string,
  options: FindOptions
): Promise<ElementHandle<Element> | null> => {
  logger.verbose(`findCss: ${cssSelector}`);

  const jsHandle = await page.evaluateHandle(
    (cssSelector, options) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.find.findCss(cssSelector, options);
    },
    cssSelector,
    options as any
  );

  return jsHandle.asElement();
};
