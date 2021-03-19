export type ElementDescriptor = {
  isContentEditable: boolean;
  inputType?: string;
  tag: string;
};

const CLICK_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "image",
  "radio",
  "reset",
  "submit",
]);

export const isFillable = (element: ElementDescriptor): boolean => {
  if (element.isContentEditable || element.tag === "textarea") return true;

  if (element.tag === "input" && !CLICK_INPUT_TYPES.has(element.inputType)) {
    return true;
  }

  return false;
};

export const getAssertText = (element: HTMLElement): string => {
  const text = (element as HTMLInputElement).value || element.innerText || "";
  if (!text.length || text.length > 500) return "";
  return text;
};

export const getDescriptor = (element: HTMLElement): ElementDescriptor => {
  const tag = element.tagName.toLowerCase();

  const descriptor: ElementDescriptor = {
    isContentEditable: element.isContentEditable,
    tag,
  };

  if (tag === "input") {
    descriptor.inputType = (element as HTMLInputElement).type;
  }

  return descriptor;
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

const buildXpath = (node: Node | null): string => {
  // only build xpaths for elements
  if (!node || node.nodeType !== 1) return "";

  const element = node as Element;
  if (element.id) {
    // xpath has no way to escape quotes so use the opposite
    // https://stackoverflow.com/a/14822893
    const quote = element.id.includes(`'`) ? `"` : `'`;
    return `//*[@id=${quote}${element.id}${quote}]`;
  }

  const children = element.parentNode ? element.parentNode.children : [];
  const sames = [].filter.call(children, (x: Element) => {
    return x.tagName === element.tagName;
  });

  const result =
    buildXpath(element.parentNode) +
    "/" +
    element.tagName.toLowerCase() +
    (sames.length > 1
      ? "[" + ([].indexOf.call(sames, element as never) + 1) + "]"
      : "");

  return result;
};

export const getXpath = (node: Node): string => {
  const result = buildXpath(node);

  return result
    .replace("svg", "*[name()='svg']")
    .replace("path", "*[name()='path']");
};

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
