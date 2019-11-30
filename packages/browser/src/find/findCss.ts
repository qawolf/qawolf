import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { FindOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page } from "puppeteer";

export const findCss = async (
  page: Page,
  selector: string,
  options: FindOptions
): Promise<ElementHandle<Element> | null> => {
  logger.verbose(`findCss: ${selector}`);

  const jsHandle = await page.evaluateHandle(
    (docSelector, options) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.find.findCss(docSelector, options);
    },
    selector,
    options as any
  );

  return jsHandle.asElement();
};
