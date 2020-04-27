import { parse as parseHtml } from '@jperl/html-parse-stringify';
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

export const htmlToDoc = (html: string): Doc => {
  const result = parseHtml(html);

  if (result.length !== 1) {
    console.debug('qawolf: invalid html', html, result);
    throw new Error('htmlToDoc: only supports individual nodes');
  }

  return result[0];
};

export const nodeToHtml = (node: Node): string => {
  const serializer = new XMLSerializer();

  const serialized = serializer
    .serializeToString(node)
    .replace(/ xmlns="(.*?)"/g, '') // remove namespace
    .replace(/(\r\n|\n|\r)/gm, ''); // remove newlines

  return serialized;
};

export const nodeToDoc = (node: Node): Doc => {
  const html = nodeToHtml(node);
  return htmlToDoc(html);
};
