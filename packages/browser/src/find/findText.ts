import { logger } from "@qawolf/logger";
import { FindElementOptions, Selector } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page, Serializable } from "puppeteer";

export const findText = async (
  page: Page,
  selector: Selector,
  options: FindElementOptions = {}
): Promise<ElementHandle<Element>> => {
  logger.verbose("findText");

  const jsHandle = await page.evaluateHandle(
    (selector, options) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.find.findText(selector, options);
    },
    selector as Serializable,
    options as Serializable
  );

  const element = jsHandle.asElement();
  if (!element) throw new Error("Element not found");

  return element;
};
