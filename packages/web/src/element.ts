import { ElementDescriptor } from "@qawolf/types";
import { getXpath } from "./xpath";

const cleanText = (text: string): string => {
  return text
    .trim()
    .replace(/[\r\n\t]+/g, " ") // remove extra newlines
    .replace(/\s\s+/g, " ") // remove excessive whitespace
    .toLowerCase();
};

export const getDataValue = (
  element: HTMLElement,
  dataAttribute: string | null
): string | null => {
  if (!dataAttribute) return null;

  return element.getAttribute(dataAttribute) || null;
};

export const getIconContent = (element: HTMLElement): string[] | null => {
  const tagName = element.tagName ? element.tagName.toLowerCase() : null;

  if (tagName === "i" && element.className) {
    return element.className.split(" ");
  } else if (tagName === "span" && element.className && !element.textContent) {
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
    const textContent = labelElements[i].textContent;
    if (textContent) {
      labels.push(cleanText(textContent));
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
        parentText.push(cleanText(textContent));
      }
    }

    // ensure all content gets included (children that aren't elements)
    parentText.push(cleanText(element.parentElement.textContent));

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

    if (!placeholderOption || !placeholderOption.textContent) return null;

    return cleanText(placeholderOption.textContent);
  } else {
    if (!(element as HTMLInputElement).placeholder) return null;

    return cleanText((element as HTMLInputElement).placeholder);
  }
};

const getSvgIconContent = (element: HTMLElement): string[] | null => {
  const iconContent: string[] = [];

  for (let i = 0; i < element.children.length; i++) {
    const childTagName = element.children[i].tagName.toLowerCase();
    if (childTagName === "path" && element.children[i].getAttribute("d")) {
      iconContent.push(element.children[i].getAttribute("d")!);
    } else if (
      childTagName === "use" &&
      element.children[i].getAttribute("href")
    ) {
      iconContent.push(element.children[i].getAttribute("href")!);
    }
  }

  return iconContent.length ? iconContent : null;
};

export const getTextContent = (element: HTMLElement): string | null => {
  if (!element.textContent) return null;

  return cleanText(element.textContent);
};

export const getDescriptor = (
  element: HTMLElement,
  dataAttribute: string | null
): ElementDescriptor => {
  const xpath = getXpath(element);

  // if a root element just return the xpath
  // since we know it will match properly
  // to avoid collecting a lot of superfluous info
  if (xpath === "/html") return { xpath };

  return {
    ariaLabel: element.getAttribute("aria-label") || null,
    classList: (element.className || "").length
      ? element.className.split(" ")
      : null,
    dataValue: getDataValue(element, dataAttribute),
    href: (element as HTMLAnchorElement).href || null,
    iconContent: getIconContent(element),
    id: element.id || null,
    inputType: (element as HTMLInputElement).type || null,
    labels: getLabels(element),
    name: (element as HTMLInputElement).name || null,
    parentText: getParentText(element),
    placeholder: getPlaceholder(element),
    tagName: element.tagName ? element.tagName.toLowerCase() : null,
    textContent: getTextContent(element),
    title: element.title || null,
    xpath
  };
};
