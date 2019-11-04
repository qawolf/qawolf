import { QAWolfWeb, sleep } from "@qawolf/web";
import { ScrollValue } from "@qawolf/types";
import { ElementHandle, Page } from "puppeteer";

export const click = async (element: ElementHandle): Promise<void> => {
  await element.click();
};

// TODO -> type
export const input = async (
  page: Page,
  elementHandle: ElementHandle,
  value?: string | string[] | null
): Promise<void> => {
  // const strValue = value || "";
  // const handleProperty = await elementHandle.getProperty("tagName");
  // const tagName = await handleProperty.jsonValue();

  // TODO
  // if (tagName.toLowerCase() === "select") {
  // await elementHandle.select(strValue);
  // } else {
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

  // down & up so we can handle @ etc
  // split by ↓,↑ with positive lookahead https://stackoverflow.com/a/12001989
  for (let key of (value as string).split(/(?=↓|↑)/)) {
    const code = (key as string).substring(1);

    console.log("type", key);
    if (key[0] === "↓") {
      await page.keyboard.down(code);
    } else {
      await page.keyboard.up(code);
    }

    await sleep(100);
  }
};

export const scroll = async (
  elementHandle: ElementHandle,
  value: ScrollValue,
  timeoutMs: number = 10000
): Promise<void> => {
  await elementHandle.evaluate(
    (element, value, timeoutMs) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.scroll(element, value, timeoutMs);
    },
    value,
    timeoutMs
  );
};
