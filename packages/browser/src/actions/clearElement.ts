import { logger } from "@qawolf/logger";
import { ElementHandle } from "playwright";

export const clearElement = async (
  elementHandle: ElementHandle
): Promise<void> => {
  // Select the element's content and press backspace to clear the element
  // We do this instead of setting the value directly since that does not mimic user behavior.
  // Ex. Some sites might rely on an isTrusted change event which we cannot simulate.
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
  // https://stackoverflow.com/a/3806004/230462
  const hasValue = await elementHandle.evaluate((element: HTMLInputElement) => {
    const value = element.isContentEditable ? element.innerText : element.value;

    if (!value || value.length <= 0) return false;

    element.focus();

    if (element.setSelectionRange) {
      element.setSelectionRange(0, value.length);
    } else if (window.getSelection && document.createRange) {
      const range = document.createRange();
      range.selectNodeContents(element);

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    return true;
  });

  if (hasValue) {
    logger.verbose("clearElement: clear value");
    await elementHandle.press("Backspace", undefined);
  } else {
    logger.verbose("clearElement: no value to clear");
  }
};
