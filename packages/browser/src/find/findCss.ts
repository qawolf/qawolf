import { logger } from "@qawolf/logger";
import { FindOptions, Selector } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page, Serializable } from "puppeteer";

export const findCss = async (
  page: Page,
  selector: Selector,
  options: FindOptions
): Promise<ElementHandle<Element> | null> => {
  logger.verbose("findCss");

  const jsHandle = await page.evaluateHandle(
    (selector, options) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.find.findCss(selector, options);
    },
    selector as Serializable,
    options as Serializable
  );

  return jsHandle.asElement();
};
