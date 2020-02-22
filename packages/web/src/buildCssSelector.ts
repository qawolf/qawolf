import { getClickableAncestor } from "./element";
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
  // find the closest element to the target with attribute
  const elementWithSelector = findAttribute(target, attribute);
  if (!elementWithSelector) {
    console.debug(
      `qawolf: no css selector built. attribute not found on target or ancestors ${attribute}`,
      getXpath(target)
    );
    return undefined;
  }

  const { attributeValue } = elementWithSelector;
  const attributeSelector = `[${attributeValue.attribute}='${attributeValue.value}']`;

  if (elementWithSelector.element === target) {
    console.debug(
      `qawolf: css selector built for target ${attributeSelector}`,
      getXpath(target)
    );
    return attributeSelector;
  }

  const descendantSelector = buildDescendantSelector(
    target as HTMLInputElement,
    isClick
  );
  const targetSelector = `${attributeSelector}${descendantSelector}`;

  console.debug(
    `qawolf: css selector built for ancestor ${targetSelector}`,
    getXpath(target)
  );

  return targetSelector;
};

export const buildDescendantSelector = (
  element: HTMLInputElement,
  isClick?: boolean
): string => {
  const inputElement = element as HTMLInputElement;
  if (["checkbox", "radio"].includes(inputElement.type) && inputElement.value) {
    // Target the value for these input types
    return ` [value='${inputElement.value}']`;
  }

  if (isClick) {
    // Target the descendant tag if it is a common clickable element
    const tagName = getClickableAncestor(element).tagName.toLowerCase();
    if (["a", "button", "input"].includes(tagName)) {
      return ` ${tagName}`;
    }

    // Hope the click on the parent with the attribute is ok
    return "";
  }

  if (element.contentEditable === "true") {
    return " [contenteditable='true']";
  }

  return ` ${element.tagName.toLowerCase()}`;
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
  if (!attribute || !element.getAttribute) return null;

  const attributes = attribute.split(",").map(attr => attr.trim());

  for (let attribute of attributes) {
    const value = element.getAttribute(attribute);
    if (value) return { attribute, value };
  }

  return null;
};
