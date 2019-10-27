import { QAWolfWeb } from "@qawolf/web";
import { ScrollValue } from "@qawolf/types";
import { ElementHandle } from "puppeteer";

export const click = async (element: ElementHandle): Promise<void> => {
  await element.click();
};

export const input = async (
  elementHandle: ElementHandle,
  value?: string | null
): Promise<void> => {
  const strValue = value || "";
  const handleProperty = await elementHandle.getProperty("tagName");
  const tagName = await handleProperty.jsonValue();

  if (tagName.toLowerCase() === "select") {
    await elementHandle.select(strValue);
  } else {
    await elementHandle.focus();

    const currentValue = await elementHandle.evaluate(
      element => (element as HTMLInputElement).value
    );

    if (currentValue) {
      // select all so we replace the text
      // from https://github.com/GoogleChrome/puppeteer/issues/1313#issuecomment-471732011
      await elementHandle.evaluate(() =>
        document.execCommand("selectall", false, "")
      );
      await elementHandle.press("Backspace");
    }

    await elementHandle.type(strValue);
  }
};

export const scrollElement = async (
  elementHandle: ElementHandle,
  value: ScrollValue,
  timeoutMs: number = 10000
): Promise<void> => {
  await elementHandle.evaluate(
    (element, value, timeoutMs) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.scrollElement(element, value, timeoutMs);
    },
    value,
    timeoutMs
  );
};
