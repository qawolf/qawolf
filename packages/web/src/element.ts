import { getXpath } from "./xpath";

export const getClickableAncestor = (
  element: HTMLElement,
  dataAttribute: string
): HTMLElement => {
  /**
   * Crawl up until we reach the top "clickable" ancestor
   */
  let ancestor = element;
  console.log("get clickable ancestor for", getXpath(element));

  while (ancestor.parentElement) {
    // short-circuit when we encounter a data value
    const dataValue = getDataValue(ancestor, dataAttribute);
    if (dataValue) {
      console.log(
        `get clickable ancestor with ${dataAttribute}="${dataValue}"`,
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
      console.log("got clickable ancestor", getXpath(ancestor));
      return ancestor;
    }

    ancestor = ancestor.parentElement;
  }

  return ancestor;
};

export const getDataValue = (
  element: HTMLElement,
  dataAttribute: string | null
): string | null => {
  if (!dataAttribute) return null;

  return element.getAttribute(dataAttribute) || null;
};

export const isClickable = (
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration
) => {
  // assume it is clickable if the cursor is a pointer
  const clickable = computedStyle.cursor === "pointer";
  return clickable && isVisible(element, computedStyle);
};

export const isVisible = (
  element: HTMLElement,
  computedStyle?: CSSStyleDeclaration
): boolean => {
  if (element.offsetWidth <= 0 || element.offsetHeight <= 0) return false;

  if (computedStyle && computedStyle.visibility === "hidden") return false;

  return true;
};
