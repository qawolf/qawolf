import { logger } from "@qawolf/logger";
import { FindElementOptions, Selector } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page as PuppeteerPage, Serializable } from "puppeteer";
import { retryExecutionError } from "../retry";

export const findElement = (
  page: PuppeteerPage,
  selector: Selector,
  options: FindElementOptions
): Promise<ElementHandle> => {
  logger.verbose("findElement");

  return retryExecutionError(async () => {
    const jsHandle = await page.evaluateHandle(
      (selector, options) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;

        if (selector.css) {
          return qawolf.find.findCss(selector, options);
        } else if (selector.html) {
          return qawolf.find.findHtml(selector, options);
        } else if (selector.text) {
          return qawolf.find.findText(selector, options);
        } else {
          throw new Error(`Invalid selector ${selector}`);
        }
      },
      selector as any,
      options as Serializable
    );

    const element = jsHandle.asElement();
    if (!element) throw new Error("Element not found");

    return element;
  });
};
