export const click = (xpath: string): void => {
  const xpathElement = findElementByXpath(xpath);

  const element = findClickableAncestor(xpathElement);
  const eventOptions = { bubbles: true };

  // simulate full click
  // https://javascript.info/mouse-events-basics
  element.dispatchEvent(new MouseEvent("mousedown", eventOptions));
  element.dispatchEvent(new MouseEvent("mouseup", eventOptions));
  element.dispatchEvent(new MouseEvent("click", eventOptions));
};

const findClickableAncestor = (element: HTMLElement): HTMLElement => {
  if (element.click) return element;
  if (!element.parentElement) {
    throw `Element ${element} does not have parent`;
  }

  return findClickableAncestor(element.parentElement);
};

const findElementByXpath = (xpath: string): HTMLElement => {
  const xpathElement = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  if (!xpathElement.singleNodeValue) {
    throw `No element found for xpath ${xpath}`;
  }

  return xpathElement.singleNodeValue as HTMLElement;
};

export const setInputValue = (xpath: string, value: string): void => {
  const xpathElement = findElementByXpath(xpath);
  if (xpathElement.tagName.toLowerCase() !== "input") {
    throw `Cannot type into ${xpathElement.tagName}`;
  }

  (xpathElement as HTMLInputElement).value = value;
};
