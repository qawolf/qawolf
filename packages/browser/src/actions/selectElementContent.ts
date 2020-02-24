import { logger } from "@qawolf/logger";
import { ElementHandle } from "playwright";

export const selectElementContent = async (
  elementHandle: ElementHandle
): Promise<void> => {
  // Select the element's content
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
  // https://stackoverflow.com/a/3806004/230462
  logger.verbose(`selectElementContent`);

  await elementHandle.evaluate((element: HTMLInputElement) => {
    // When element.select() is supported by browsers we can use that instead
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/select
    if (element.setSelectionRange) {
      try {
        element.setSelectionRange(0, element.value.length);
      } catch (e) {
        // setSelectionRange throws an error for inputs: number/date/time/etc
        // we can just blur/focus them and the content will be selected
        element.blur();
        element.focus();
      }
    } else if (window.getSelection && document.createRange) {
      const range = document.createRange();
      range.selectNodeContents(element);

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  });
};
