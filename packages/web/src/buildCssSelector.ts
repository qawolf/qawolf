import { Action } from "@qawolf/types";
import { getXpath } from "./xpath";

interface AttributeValuePair {
  attribute: string;
  value: string;
}

export interface BuildCssSelectorOptions {
  action: Action;
  attribute: string;
  element: HTMLElement;
}

interface ElementAttributeValuePair {
  attributeValue: AttributeValuePair;
  element: HTMLElement;
}

export const buildCssSelector = ({
  action,
  attribute,
  element
}: BuildCssSelectorOptions): string | undefined => {
  // get the closest element to the target with attribute
  const elementWithSelector = findAttribute(element, attribute);
  if (!elementWithSelector) {
    console.debug(`No CSS selector found for for`, getXpath(element));
    return undefined;
  }

  const { attributeValue } = elementWithSelector;
  const cssSelector = `[${attributeValue.attribute}='${attributeValue.value}']`;

  // if target same as element with the attribute, return the CSS selector as is
  if (elementWithSelector.element === element) {
    console.debug(`Found CSS selector ${cssSelector} for`, getXpath(element));
    return cssSelector;
  }

  // element with selector is an ancestor
  const targetSelector = getSelectorTarget(element as HTMLInputElement, action);
  const finalSelector = `${cssSelector}${targetSelector}`;

  console.debug(`Found CSS selector ${finalSelector} for`, getXpath(element));

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
  action: Action
): string => {
  // unless we are clicking, we need to build descendant selector for the target
  const inputElement = element as HTMLInputElement;
  if (["checkbox", "radio"].includes(inputElement.type) && inputElement.value) {
    return ` [value='${inputElement.value}']`;
  } else if (action !== "click") {
    return ` ${element.tagName.toLowerCase()}`;
  }

  return "";
};
