export const isVisible = (
  element: Element,
  computedStyle?: CSSStyleDeclaration
): boolean => {
  const htmlElement = element as HTMLElement;
  if (htmlElement.offsetWidth <= 0 || htmlElement.offsetHeight <= 0) {
    return false;
  }

  if (computedStyle && computedStyle.visibility === "hidden") {
    return false;
  }

  if (computedStyle && computedStyle.display === "none") {
    return false;
  }

  return true;
};

/**
 * @summary Returns the topmost isContentEditable ancestor. Editable areas can
 *   have HTML elements in them, and these elements emit events, but in general
 *   I don't think we want to keep track of anything within the editable area.
 *   For example, if you click a particular paragraph in a `contenteditable`
 *   div, we should just record it as a click/focus of the editable div.
 */
export const getTopmostEditableElement = (
  element: HTMLElement
): HTMLElement => {
  if (!element.isContentEditable) return element;

  let ancestor = element;
  do {
    if (!ancestor.parentElement || !ancestor.parentElement.isContentEditable) {
      return ancestor;
    }

    ancestor = ancestor.parentElement;
  } while (ancestor);

  // This should never be hit, but here as a safety
  return element;
};

/**
 * @summary Returns the current "value" of an element. Pass in an event `target`.
 *   For example, returns the `.value` or the `.innerText` of a content-editable.
 *   If no value can be determined, returns `null`.
 */
export const getInputElementValue = (
  element: HTMLInputElement
): string | null => {
  let inputValue: string;

  // In the wild, we've seen examples of input elements with `contenteditable=true`,
  // but an `input` never has inner text, so we check for `input` tag name here.
  if (element.isContentEditable && element.tagName.toLowerCase() !== "input") {
    inputValue = element.innerText;
  } else {
    inputValue = element.value;
  }

  return typeof inputValue === "string" ? inputValue : null;
};
