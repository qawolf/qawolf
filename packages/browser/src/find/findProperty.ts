import { FindOptions, Selector } from "@qawolf/types";
import { Page } from "puppeteer";
import { find } from "./find";

export const findProperty = async (
  page: Page,
  selector: Selector,
  property: string,
  options: FindOptions
): Promise<string | null | undefined> => {
  try {
    const element = await find(page, selector, options);

    const propertyHandle = await element.getProperty(property);
    const propertyValue = await propertyHandle.jsonValue();

    return propertyValue;
  } catch (e) {
    // return null if the element is not found
    if ((e as Error).message === "Element not found") return null;

    throw e;
  }
};
