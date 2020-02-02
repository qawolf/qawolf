import { logger } from "@qawolf/logger";
import { FindElementOptions, Selector } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page as PlaywrightPage } from "playwright";
import { retryExecutionError } from "../retry";

export const findElement = (
  page: PlaywrightPage,
  selector: Selector,
  options: FindElementOptions
): Promise<ElementHandle> => {
  logger.verbose("findElement");

  return retryExecutionError(async () => {
    const jsHandle = await page.evaluateHandle(
      (selector, options) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;

        let elementPromise: Promise<Element | null>;

        if (selector.css) {
          elementPromise = qawolf.find.findCss(selector, options);
        } else if (selector.html) {
          elementPromise = qawolf.find.findHtml(selector, options);
        } else if (selector.text) {
          elementPromise = qawolf.find.findText(selector, options);
        } else {
          elementPromise = Promise.reject(`Invalid selector ${selector}`);
        }

        return elementPromise
          .then(element => {
            if (!element) {
              console.log("qawolf: element was not found");
            }

            return element;
          })
          .catch(error => {
            console.log("qawolf: element was not found", error);

            return null;
          });
      },
      selector as any,
      options
    );

    const element = jsHandle.asElement();
    if (!element) {
      throw new Error("Element not found");
    }

    return element;
  });
};
