import { getDataValue, isClickable } from "./element";
import { waitFor } from "./wait";
import { getXpath } from "./xpath";

export const findClickableAncestor = (
  element: HTMLElement,
  dataAttribute: string
): HTMLElement => {
  /**
   * Crawl up until we reach the top "clickable" ancestor
   */
  let ancestor = element;
  console.log("find clickable ancestor for", getXpath(element));

  while (ancestor.parentElement) {
    // short-circuit when we encounter a data value
    const dataValue = getDataValue(ancestor, dataAttribute);
    if (dataValue) {
      console.log(
        `found clickable ancestor with ${dataAttribute}="${dataValue}"`,
        getXpath(ancestor)
      );
      return ancestor;
    }

    // short-circuit when we encounter a common clickable element type
    // there may be a parent that is still clickable but does something else
    if (["a", "button", "input"].includes(ancestor.tagName.toLowerCase())) {
      return ancestor;
    }

    // stop at the top clickable ancestor
    if (
      !isClickable(
        ancestor.parentElement,
        window.getComputedStyle(ancestor.parentElement)
      )
    ) {
      console.log("found clickable ancestor", getXpath(ancestor));
      return ancestor;
    }

    ancestor = ancestor.parentElement;
  }

  return ancestor;
};

export const hasText = async (
  text: string,
  timeoutMs: number
): Promise<boolean> => {
  const hasTextFn = () => {
    const innerText = document.documentElement
      ? document.documentElement.innerText
      : "";
    if (innerText.includes(text)) {
      return true;
    }
    return null;
  };

  const result = await waitFor(hasTextFn, timeoutMs, 100);
  return result || false;
};
