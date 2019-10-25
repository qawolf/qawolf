import { QAWolfWeb, sleep } from "@qawolf/web";
import { ElementHandle, Page } from "puppeteer";

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
