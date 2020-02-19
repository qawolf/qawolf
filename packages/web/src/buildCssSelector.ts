import { getXpath } from "./xpath";

export interface AttributeValuePair {
  attribute: string;
  value: string;
}

export interface BuildCssSelectorOptions {
  attribute: string;
  isClick?: boolean;
  target: HTMLElement;
}

interface ElementAttributeValuePair {
  attributeValue: AttributeValuePair;
  element: HTMLElement;
}

export const buildCssSelector = ({
  attribute,
  isClick,
  target
}: BuildCssSelectorOptions): string | undefined => {
  // get the closest element to the target with attribute
  const elementWithSelector = findAttribute(target, attribute);
  if (!elementWithSelector) {
    console.debug(`No CSS selector found for for`, getXpath(target));
    return undefined;
  }

  const { attributeValue } = elementWithSelector;
  const cssSelector = `[${attributeValue.attribute}='${attributeValue.value}']`;

  // if target same as element with the attribute, return the CSS selector as is
  if (elementWithSelector.element === target) {
    console.debug(`Found CSS selector ${cssSelector} for`, getXpath(target));
    return cssSelector;
  }

  // target with selector is an ancestor
  const targetSelector = getSelectorTarget(target as HTMLInputElement, isClick);
  const finalSelector = `${cssSelector}${targetSelector}`;

  console.debug(`Found CSS selector ${finalSelector} for`, getXpath(target));

  return finalSelector;
};

export const findAttribute = (
  element: HTMLElement,
  attribute: string
): ElementAttributeValuePair | null => {
  let ancestor: HTMLElement | null = element;

  while (ancestor) {
    const attributeValue = getAttributeValue(ancestor, attribute);

    if (attributeValue) {
      return { attributeValue, element: ancestor };
    }

    ancestor = ancestor.parentElement;
  }

  return null;
};

export const getAttributeValue = (
  element: HTMLElement,
  attribute: string
): AttributeValuePair | null => {
  if (!attribute) return null;

  const attributes = attribute.split(",").map(attr => attr.trim());
  for (let attribute of attributes) {
    const value = element.getAttribute(attribute);
    if (value) return { attribute, value };
  }

  return null;
};

export const getSelectorTarget = (
  element: HTMLInputElement,
  isClick?: boolean
): string => {
  // unless we are clicking, we need to build descendant selector for the target
  const inputElement = element as HTMLInputElement;
  if (["checkbox", "radio"].includes(inputElement.type) && inputElement.value) {
    return ` [value='${inputElement.value}']`;
  } else if (!isClick) {
    return element.contentEditable === "true"
      ? " [contenteditable='true']"
      : ` ${element.tagName.toLowerCase()}`;
  }

  return "";
};
