import { ElementDescriptor } from "@qawolf/types";
import { cleanText } from "./lang";
import { getDataValue } from "./element";
import { getXpath } from "./xpath";

export const getAlt = (element: HTMLElement): string | null => {
  if ((element as HTMLImageElement).alt) {
    return (element as HTMLImageElement).alt;
  }

  // see if element has image child and if so grab its alt
  const imgChild = element.querySelector("img");
  if (!imgChild) return null;

  return imgChild.alt || null;
};

export const getIconContent = (element: HTMLElement): string[] | null => {
  const tagName = element.tagName ? element.tagName.toLowerCase() : null;

  if (tagName === "i" && element.className) {
    return element.className.split(" ");
  } else if (tagName === "span" && element.className && !element.innerText) {
    return element.className.split(" ");
  } else if (tagName === "svg" && element.children.length) {
    return getSvgIconContent(element);
  } else if (element.children.length) {
    let iconContent: string[] = [];

    for (let i = 0; i < element.children.length; i++) {
      const childIconContent = getIconContent(element.children[
        i
      ] as HTMLElement);
      if (childIconContent) {
        iconContent = iconContent.concat(childIconContent);
      }
    }
    return iconContent.length ? iconContent : null;
  }

  return null;
};

export const getLabels = (element: HTMLElement): string[] | null => {
  const labelElements = (element as HTMLInputElement).labels;

  if (!labelElements || !labelElements.length) return null;

  const labels: string[] = [];

  for (let i = 0; i < labelElements.length; i++) {
    const innerText = labelElements[i].innerText;
    if (innerText) {
      labels.push(cleanText(innerText));
    }
  }

  return labels;
};

export const getParentText = (element: HTMLElement): string[] | null => {
  if (!element.parentElement) return null;

  if (element.parentElement.innerText) {
    const parentText: string[] = [];

    for (let i = 0; i < element.parentElement.children.length; i++) {
      const innerText = (element.parentElement.children[i] as HTMLElement)
        .innerText;
      if (innerText) {
        parentText.push(cleanText(innerText));
      }
    }

    // ensure all content gets included (children that aren't elements)
    parentText.push(cleanText(element.parentElement.innerText));

    return parentText;
  }

  return getParentText(element.parentElement);
};

export const getPlaceholder = (element: HTMLElement): string | null => {
  if (element.tagName && element.tagName.toLowerCase() === "select") {
    const options = (element as HTMLSelectElement).options;
    let placeholderOption: HTMLOptionElement | null = null;

    for (let i = 0; i < options.length; i++) {
      if (options[i].disabled) {
        placeholderOption = options[i];
        break;
      }
    }

    if (!placeholderOption || !placeholderOption.innerText) return null;

    return cleanText(placeholderOption.innerText);
  } else {
    if (!(element as HTMLInputElement).placeholder) return null;

    return cleanText((element as HTMLInputElement).placeholder);
  }
};

export const getSrc = (element: HTMLElement): string | null => {
  if ((element as HTMLImageElement).src) {
    return (element as HTMLImageElement).src;
  }

  // see if element has image child and if so grab its src
  const imgChild = element.querySelector("img");
  if (!imgChild) return null;

  return imgChild.src || null;
};

const getSvgIconContent = (element: HTMLElement): string[] | null => {
  const iconContent: string[] = [];

  for (let i = 0; i < element.children.length; i++) {
    iconContent.push(element.children[i].outerHTML);
  }

  return iconContent.length ? iconContent : null;
};

export const getTextContent = (element: HTMLElement): string | null => {
  if (!element.innerText) return null;

  return cleanText(element.innerText);
};

export const getDescriptor = (
  element: HTMLElement,
  dataAttribute: string | null
): ElementDescriptor => {
  const xpath = getXpath(element);

  const tagName = element.tagName ? element.tagName.toLowerCase() : null;

  // if a root element avoid collecting a lot of superfluous info
  // just return the xpath for matching
  // and tagName for test naming
  if (xpath === "/html" || xpath === "/html/body") {
    return {
      tagName,
      xpath
    };
  }

  return {
    alt: getAlt(element),
    ariaLabel: element.getAttribute("aria-label") || null,
    classList: (element.className || "").length
      ? element.className.split(" ")
      : null,
    dataValue: getDataValue(element, dataAttribute),
    href: (element as HTMLAnchorElement).href || null,
    iconContent: getIconContent(element),
    id: element.id || null,
    inputType: (element as HTMLInputElement).type || null,
    isContentEditable: element.isContentEditable,
    labels: getLabels(element),
    name: (element as HTMLInputElement).name || null,
    parentText: getParentText(element),
    placeholder: getPlaceholder(element),
    src: getSrc(element),
    innerText: getTextContent(element),
    tagName,
    title: element.title || null,
    xpath
  };
};
