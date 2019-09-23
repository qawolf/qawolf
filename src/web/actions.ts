export const click = async (xpath: string) => {
  const xpathElement = await findElementByXpath(xpath);

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

const findElementByXpath = async (
  xpath: string,
  timeout: number = 5000
): Promise<HTMLElement> => {
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );

  if (result.singleNodeValue) {
    return result.singleNodeValue as HTMLElement;
  }

  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );

      if (result) {
        clearInterval(intervalId);
        clearTimeout(rejectId);
        resolve(result.singleNodeValue as HTMLElement);
      }
    }, 100);

    const rejectId = setTimeout(() => {
      reject(`No element found for xpath ${xpath}`);
      clearInterval(intervalId);
    }, timeout);
  });
};

export const setInputValue = async (xpath: string, value: string) => {
  const xpathElement = await findElementByXpath(xpath);
  if (xpathElement.tagName.toLowerCase() !== "input") {
    throw `Cannot type into ${xpathElement.tagName}`;
  }

  (xpathElement as HTMLInputElement).value = value;
};
