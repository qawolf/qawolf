import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page } from "puppeteer";

export const click = async (element: ElementHandle): Promise<void> => {
  await element.click();
};

export const input = async (
  elementHandle: ElementHandle,
  value: string = ""
): Promise<void> => {
  const handleProperty = await elementHandle.getProperty("tagName");
  const tagName = await handleProperty.jsonValue();

  if (tagName.toLowerCase() === "select") {
    await elementHandle.select(value);
  } else {
    // clear current value
    await elementHandle.evaluate(element => {
      (element as HTMLInputElement).value = "";
    });

    await elementHandle.type(value);
  }
};

export const scroll = async (
  page: Page,
  yPosition: number,
  timeoutMs: number = 10000
): Promise<void> => {
  await page.evaluate(
    (yPosition, timeoutMs) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.scrollTo(yPosition, timeoutMs);
    },
    yPosition,
    timeoutMs
  );
};
