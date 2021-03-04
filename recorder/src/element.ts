// --
// from playwright to match their text engine
function shouldSkipForTextMatching(element: Element | ShadowRoot) {
  return (
    element.nodeName === "SCRIPT" ||
    element.nodeName === "STYLE" ||
    (document.head && document.head.contains(element))
  );
}

export function elementText(root: Element | ShadowRoot): string {
  let value = "";

  if (!shouldSkipForTextMatching(root)) {
    if (
      root instanceof HTMLInputElement &&
      (root.type === "submit" || root.type === "button")
    ) {
      value = root.value;
    } else {
      for (let child = root.firstChild; child; child = child.nextSibling) {
        if (child.nodeType === Node.ELEMENT_NODE)
          value += elementText(child as Element);
        else if (child.nodeType === Node.TEXT_NODE)
          value += child.nodeValue || "";

        // skip long text
        if (value.length > 100) break;
      }
      if ((root as Element).shadowRoot)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        value += elementText((root as Element).shadowRoot!);
    }
  }

  return value;
}
// --

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
