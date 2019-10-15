export const findElementByXpath = (xpath: string): HTMLElement | null => {
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

  return null;
};

const buildXpath = (element: Element): string => {
  if (!element || element.nodeType !== 1) return "";

  if (element.id) return "//*[@id='" + element.id + "']";

  const children = element.parentNode ? element.parentNode.children : [];
  const sames = [].filter.call(children, (x: Element) => {
    return x.tagName === element.tagName;
  });

  const result =
    buildXpath(element.parentNode as Element) +
    "/" +
    element.tagName.toLowerCase() +
    (sames.length > 1
      ? "[" + ([].indexOf.call(sames, element as never) + 1) + "]"
      : "");

  return result;
};

export const getXpath = (element: Element): string => {
  const result = buildXpath(element);

  return result
    .replace("svg", "*[name()='svg']")
    .replace("path", "*[name()='path']");
};

export const isXpathEqual = (
  xpathA?: string | null,
  xpathB?: string | null
) => {
  if (!xpathA || !xpathB) return false;
  if (xpathA === xpathB) return true;

  const resolveSameElement =
    findElementByXpath(xpathA) === findElementByXpath(xpathB);
  return resolveSameElement;
};
