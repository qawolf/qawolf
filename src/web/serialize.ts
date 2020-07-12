import { Doc } from '../types';

const buildXpath = (node: Node | null): string => {
  // only build xpaths for elements
  if (!node || node.nodeType !== 1) return '';

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
    '/' +
    element.tagName.toLowerCase() +
    (sames.length > 1
      ? '[' + ([].indexOf.call(sames, element as never) + 1) + ']'
      : '');

  return result;
};

export const getXpath = (node: Node): string => {
  const result = buildXpath(node);

  return result
    .replace('svg', "*[name()='svg']")
    .replace('path', "*[name()='path']");
};

export const nodeToDoc = (node: Node): Doc => {
  const name = ((node as HTMLElement).tagName || '').toLowerCase();

  const attrs = {};

  const attributes = (node as HTMLElement).attributes || [];
  for (let i = attributes.length - 1; i >= 0; i--) {
    attrs[attributes[i].name] = attributes[i].value;
  }

  return {
    attrs,
    name,
  };
};
