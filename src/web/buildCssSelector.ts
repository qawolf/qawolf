import { getXpath } from './xpath';

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

// adapted from https://stackoverflow.com/a/33416684/230462
export const deserializeRegex = (regexString: string): RegExp | null => {
  try {
    const parts = regexString.match(/\/(.*)\/(.*)?/) as RegExpMatchArray;
    return new RegExp(parts[1], parts[2] || '');
  } catch (e) {
    console.error(
      `qawolf: invalid regex attribute ${regexString}, skipping this attribute`,
    );
    return null;
  }
};

const getRegexAttributeValue = (
  element: HTMLElement,
  regexString: string,
): AttributeValuePair | null => {
  const regex = deserializeRegex(regexString);
  if (!regex) return null;

  const attributes = element.attributes;

  for (let i = 0; i < attributes.length; i++) {
    const { name, value } = attributes[i];

    if (name.match(regex)) {
      return { attribute: name, value };
    }
  }

  return null;
};

export const getAttributeValue = (
  element: HTMLElement,
  attribute: string,
): AttributeValuePair | null => {
  if (!attribute || !element.getAttribute) return null;

  const attributes = attribute.split(',').map(attr => attr.trim());

  for (const attribute of attributes) {
    const isRegex = attribute[0] === '/';

    if (isRegex) {
      const attributeValuePair = getRegexAttributeValue(element, attribute);
      if (attributeValuePair) return attributeValuePair;
    } else {
      const value = element.getAttribute(attribute);
      if (value) return { attribute, value };
    }
  }

  return null;
};

export const findAttributes = (
  element: HTMLElement,
  attribute: string,
): ElementAttributeValuePair[] | null => {
  let ancestor: HTMLElement | null = element;
  const elementAttributes: ElementAttributeValuePair[] = [];

  while (ancestor) {
    const attributeValue = getAttributeValue(ancestor, attribute);

    if (attributeValue) {
      elementAttributes.push({ attributeValue, element: ancestor });
    }

    ancestor = ancestor.parentElement;
  }

  return elementAttributes.length ? elementAttributes : null;
};

export const findClickableDescendantTag = (
  descendant: HTMLElement,
  ancestor: HTMLElement,
): string => {
  /**
   * Target common clickable descendant tags.
   * Ex. the DatePicker's date button
   */
  let parent: HTMLElement | null = descendant;

  // stop when we hit the ancestor
  while (parent && parent !== ancestor) {
    const tagName = parent.tagName.toLowerCase();
    if (['a', 'button', 'input'].includes(tagName)) {
      return ` ${tagName}`;
    }

    parent = parent.parentElement;
  }

  return '';
};

export const buildAttributeSelector = (
  elementAttributes: ElementAttributeValuePair[],
  descendantSelector = '',
): string => {
  // include as many ancestors in selector as needed to ensure final selector is unique
  const selectors: string[] = [];

  for (let i = 0; i < elementAttributes.length; i++) {
    const { attributeValue } = elementAttributes[i];
    selectors.unshift(
      `[${attributeValue.attribute}='${attributeValue.value}']`,
    );

    const candidateSelector = `${selectors.join(' ')}${descendantSelector}`;
    if (document.querySelectorAll(candidateSelector).length === 1) {
      break;
    }
  }

  return selectors.join(' ');
};

export const buildDescendantSelector = (
  descendant: HTMLInputElement,
  ancestor: HTMLElement,
  isClick?: boolean,
): string => {
  const inputElement = descendant as HTMLInputElement;
  if (['checkbox', 'radio'].includes(inputElement.type) && inputElement.value) {
    // Target the value for these input types
    return ` [value='${inputElement.value}']`;
  }

  if (isClick) {
    return findClickableDescendantTag(descendant, ancestor);
  }

  if (descendant.contentEditable === 'true') {
    return " [contenteditable='true']";
  }

  return ` ${descendant.tagName.toLowerCase()}`;
};

export const buildCssSelector = ({
  attribute,
  isClick,
  target,
}: BuildCssSelectorOptions): string | undefined => {
  // find the closest element to the target with attribute
  const elementsWithSelector = findAttributes(target, attribute);
  if (!elementsWithSelector) {
    console.debug(
      `qawolf: no css selector built. attribute not found on target or ancestors ${attribute}`,
      getXpath(target),
    );
    return undefined;
  }

  // lowest element with data attribute in DOM tree
  const elementWithSelector = elementsWithSelector[0];

  if (elementWithSelector.element === target) {
    const selector = buildAttributeSelector(elementsWithSelector);
    console.debug(
      `qawolf: css selector built for target ${selector}`,
      getXpath(target),
    );
    return selector;
  }

  const descendantSelector = buildDescendantSelector(
    target as HTMLInputElement,
    elementWithSelector.element,
    isClick,
  );
  const attributeSelector = buildAttributeSelector(
    elementsWithSelector,
    descendantSelector,
  );
  const targetSelector = `${attributeSelector}${descendantSelector}`;

  console.debug(
    `qawolf: css selector built for ancestor ${targetSelector}`,
    getXpath(target),
  );

  return targetSelector;
};
