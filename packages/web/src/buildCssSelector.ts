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

export const buildCssSelector = ({
  action,
  attribute,
  element
}: BuildCssSelectorOptions): string | undefined => {
  console.debug("qawolf: get attribute value for", getXpath(element));
  let ancestor = element;

  while (ancestor) {
    const attributeValue = getAttributeValue(ancestor, attribute);

    if (attributeValue) {
      const { attribute, value } = attributeValue;
      console.debug(
        `qawolf: found ${attribute} attribute: ${value} for`,
        getXpath(element)
      );

      return `[${attribute}='${value}']`;
    }

    ancestor = ancestor.parentElement;
  }

  console.debug("qawolf: no attribute value found for", getXpath(element));

  return undefined;
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
