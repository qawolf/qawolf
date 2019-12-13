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

const buildXpath = (node: Node | null): string => {
  // only build xpaths for elements
  if (!node || node.nodeType !== 1) return "";

  const element = node as Element;
  if (element.id) {
    // xpath has no way to escape quotes so use the opposite
    // https://stackoverflow.com/a/14822893
    const quote = element.id.includes(`'`) ? `"` : `'`;
    return `//*[@id=${quote}${element.id}${quote}]`;
  }

  const children = element.parentNode ? element.parentNode.children : [];
  const sames = [].filter.call(children, (x: Element) => {
    return x.tagName === element.tagName;
  });

  const result =
    buildXpath(element.parentNode) +
    "/" +
    element.tagName.toLowerCase() +
    (sames.length > 1
      ? "[" + ([].indexOf.call(sames, element as never) + 1) + "]"
      : "");

  return result;
};

export const getXpath = (node: Node): string => {
  const result = buildXpath(node);

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
