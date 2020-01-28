import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle } from "playwright";

export const getXpath = async (element: ElementHandle<Node> | null) => {
  if (!element) return null;

  return element.evaluate(element => {
    const qawolf: QAWolfWeb = (window as any).qawolf;
    return qawolf.xpath.getXpath(element!);
  });
};
