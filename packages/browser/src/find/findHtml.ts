import { CONFIG } from "@qawolf/config";
import { DocSelector, Locator } from "@qawolf/types";
import { htmlToDocSelector, QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page } from "puppeteer";

export type FindHtmlSelecotr = string | DocSelector;

// TODO how to get action & value ....
// TODO selector vs locator
export const findHtml = async (
  page: Page,
  locator: HtmlLocator,
  timeoutMs: number
): Promise<ElementHandle> => {
  const selector =
    typeof locator === "string"
      ? // convert the html string to a doc selector
        htmlToDocSelector({ node: locator, ancestors: [] })
      : locator;

  const jsHandle = await page.evaluateHandle(
    (locator: Locator) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.find.findElement(locator);
    },
    {
      action,
      dataAttribute: CONFIG.dataAttribute,
      selector,
      timeoutMs: findTimeoutMs,
      value: step.value
    } as any
  );

  const handle = jsHandle.asElement();
  if (!handle) {
    throw new Error(`No element handle found for step ${step.index}`);
  }

  return handle;
};
