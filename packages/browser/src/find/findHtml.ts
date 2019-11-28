import { CONFIG } from "@qawolf/config";
import { DocSelector, FindOptions } from "@qawolf/types";
import { htmlToDoc, QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page } from "puppeteer";

export type HtmlSelector = string | DocSelector;

export const findHtml = async (
  page: Page,
  selector: HtmlSelector,
  options: FindOptions
): Promise<ElementHandle | null> => {
  const docSelector =
    typeof selector === "string"
      ? { node: htmlToDoc(selector), ancestors: [] }
      : selector;

  const jsHandle = await page.evaluateHandle(
    (docSelector, options) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.find.findHtml(docSelector, options);
    },
    docSelector as any,
    {
      ...options,
      dataAttribute: CONFIG.dataAttribute
    } as any
  );

  return jsHandle.asElement();
};
