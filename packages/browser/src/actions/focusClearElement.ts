import { logger } from "@qawolf/logger";
import { ElementHandle } from "puppeteer";

export const focusClearElement = async (
  elementHandle: ElementHandle
): Promise<void> => {
  logger.verbose("focusClearElement: focus");
  await elementHandle.focus();

  const currentValue = await elementHandle.evaluate((element: HTMLElement) => {
    if (element.isContentEditable) return element.innerText;
    return (element as HTMLInputElement).value;
  });

  if (!currentValue) return;

  logger.verbose("focusClearElement: clear");

  // Select all so we replace the text
  // from https://github.com/GoogleChrome/puppeteer/issues/1313#issuecomment-471732011
  // We do this instead of setting the value directly since that does not mimic user behavior.
  // Ex. Some sites might rely on an isTrusted change event which we cannot simulate.
  await elementHandle.evaluate(() =>
    document.execCommand("selectall", false, "")
  );
  await elementHandle.press("Backspace");
};
