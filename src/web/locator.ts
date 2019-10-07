// import { CONFIG } from "../config";
import { Locator } from "../types";
import { getXpath } from "./xpath";

export const getDataAttribute = (element: HTMLElement): string | null => {
  // const dataAttribute = CONFIG.dataAttribute;
  const dataAttribute = "data-qa";
  if (!dataAttribute) return null;

  return element.getAttribute(dataAttribute) || null;
};

export const getLabels = (element: HTMLElement): string[] | null => {
  const labelElements = (element as HTMLInputElement).labels;

  if (!labelElements || !labelElements.length) return null;

  const labels: string[] = [];

  for (let i = 0; i < labelElements.length; i++) {
    const textContent = labelElements[i].textContent;
    if (textContent) {
      labels.push(textContent.toLowerCase());
    }
  }

  return labels;
};

export const getParentText = (element: HTMLElement): string[] | null => {
  if (!element.parentElement) return null;

  if (element.parentElement.textContent) {
    const parentText: string[] = [];

    for (let i = 0; i < element.parentElement.children.length; i++) {
      const textContent = element.parentElement.children[i].textContent;
      if (textContent) {
        parentText.push(textContent.toLowerCase());
      }
      // ensure all content gets included (children that aren't elements)
      parentText.push(element.parentElement.textContent.toLowerCase());
    }

    return parentText;
  }

  return getParentText(element.parentElement);
};

export const getPlaceholder = (element: HTMLElement): string | null => {
  if (!(element as HTMLInputElement).placeholder) return null;

  return (element as HTMLInputElement).placeholder.toLowerCase();
};

export const getLocator = (element: HTMLElement | null): Locator | null => {
  if (!element) {
    return null;
  }

  return {
    classList: (element.className || "").length
      ? element.className.split(" ")
      : null,
    dataAttribute: getDataAttribute(element),
    href: (element as HTMLAnchorElement).href || null,
    id: element.id || null,
    inputType: (element as HTMLInputElement).type || null,
    labels: getLabels(element),
    name: (element as HTMLInputElement).name || null,
    parentText: getParentText(element),
    placeholder: getPlaceholder(element),
    tagName: element.tagName ? element.tagName.toLowerCase() : null,
    textContent: getTextContent(element),
    xpath: getXpath(element)
  };
};

export const getTextContent = (element: HTMLElement): string | null => {
  if (!element.textContent) return null;

  return element.textContent.toLowerCase();
};
