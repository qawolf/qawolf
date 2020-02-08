import { logger } from "@qawolf/logger";
import { ElementHandle } from "playwright";

export const clearElement = async (
  elementHandle: ElementHandle
): Promise<void> => {
  // Select all so we replace the text
  // From https://github.com/puppeteer/puppeteer/issues/1313#issuecomment-471732011
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
  // We do this instead of setting the value directly since that does not mimic user behavior.
  // Ex. Some sites might rely on an isTrusted change event which we cannot simulate.
  const hasValue = await elementHandle.evaluate((element: HTMLInputElement) => {
    const value = element.isContentEditable ? element.innerText : element.value;
    if (!value || value.length <= 0) return false;

    element.focus();
    element.setSelectionRange(0, value.length);
    return true;
  });

  if (!hasValue) {
    logger.verbose("clearElement: nothing to clear");
    return;
  }

  logger.verbose("clearElement: clear value");
  await elementHandle.press("Backspace", undefined);
};
