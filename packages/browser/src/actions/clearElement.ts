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
  const shouldBackspace = await elementHandle.evaluate(
    (element: HTMLInputElement) => {
      const value = element.isContentEditable
        ? element.innerText
        : element.value;

      if (!value || value.length <= 0) return false;

      if (!element.setSelectionRange) {
        if (element.isContentEditable) {
          console.log("qawolf: clear content editable", element);
          element.innerHTML = "";
        }

        return false;
      }

      element.focus();
      element.setSelectionRange(0, value.length);
      return true;
    }
  );

  if (!shouldBackspace) return;

  logger.verbose("clearElement: backspace");
  await elementHandle.press("Backspace", undefined);
};
