import { logger } from "@qawolf/logger";
import { FindOptions, Selector } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page, Serializable } from "puppeteer";

export const findHtml = async (
  page: Page,
  selector: Selector,
  options: FindOptions
): Promise<ElementHandle<Element> | null> => {
  logger.verbose("findHtml");

  const jsHandle = await page.evaluateHandle(
    (selector, options) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const findCmd = () => qawolf.find.findHtml(selector, options);
      // store the last find on the window for easy debugging
      (window as any).qaw_find = findCmd;
      return findCmd();
    },
    selector as Serializable,
    options as Serializable
  );

  return jsHandle.asElement();
};
