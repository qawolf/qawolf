import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { DocSelector, FindOptions } from "@qawolf/types";
import { htmlToDoc, QAWolfWeb, serializeDocSelector } from "@qawolf/web";
import { ElementHandle, Page } from "puppeteer";

export type HtmlSelector = string | DocSelector;

export const findHtml = async (
  page: Page,
  selector: HtmlSelector,
  options: FindOptions
): Promise<ElementHandle<Element> | null> => {
  const docSelector =
    typeof selector === "string"
      ? // convert the html to a document
        { ancestors: [], node: htmlToDoc(selector) }
      : selector;

  logger.verbose(
    `findHtml: ${serializeDocSelector(docSelector)} ${JSON.stringify(options)}`
  );

  const jsHandle = await page.evaluateHandle(
    (docSelector, options) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.find.findHtml(docSelector, options);
    },
    docSelector as any,
    {
      ...options,
      dataAttribute: options.dataAttribute || CONFIG.dataAttribute
    } as any
  );

  return jsHandle.asElement();
};
