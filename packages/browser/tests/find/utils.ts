import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle } from "puppeteer";

export const getXpath = async (element: ElementHandle<Element> | null) => {
  if (!element) return null;

  return element.evaluate(element => {
    const qawolf: QAWolfWeb = (window as any).qawolf;
    return qawolf.xpath.getXpath(element!);
  });
};
