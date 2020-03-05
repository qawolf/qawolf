import { parse as parseHtml } from '@jperl/html-parse-stringify';
import { cleanText } from './lang';
import { Callback, Doc } from '../types';

export const inlineInnerTextLabels = (node: Node): Callback<void> => {
  const element = node as HTMLInputElement;

  if (element.innerText) {
    // clean the text to prevent weird serialization of line breaks
    element.setAttribute('qaw_innertext', cleanText(element.innerText));
  }

  if (element.labels) {
    // set the labels as an attribute so they are serialized
    const labels: string[] = [];

    element.labels.forEach(label => {
      if (label.innerText.length) labels.push(cleanText(label.innerText));
    });

    if (labels.length) {
      element.setAttribute('qaw_labels', labels.join(' '));
    }
  }

  // cleanNodeFn
  return (): void => {
    if (!element.removeAttribute) return;

    element.removeAttribute('qaw_innertext');
    element.removeAttribute('qaw_labels');
  };
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
  const element = node as HTMLElement;

  // serialize top level nodes by their tag only
  if (element.tagName === 'HTML') return '<html />';
  if (element.tagName === 'BODY') return '<body />';

  const serializer = new XMLSerializer();

  // serialize labels as html attribute
  const cleanNodeFn = inlineInnerTextLabels(node);

  const serialized = serializer
    .serializeToString(node)
    .replace(/ xmlns="(.*?)"/g, '') // remove namespace
    .replace(/(\r\n|\n|\r)/gm, ''); // remove newlines

  cleanNodeFn();

  return serialized;
};

export const nodeToDoc = (node: Node): Doc => htmlToDoc(nodeToHtml(node));

const cloneNodeShallow = (node: Node): Node => {
  // inline labels if possible
  const cleanNodeFn = inlineInnerTextLabels(node);
  const shallowNode = node.cloneNode(false);
  cleanNodeFn();
  return shallowNode;
};

export const nodeToHtmlSelector = (
  node: Node,
  numAncestors: number,
): string => {
  let shallowNode = cloneNodeShallow(node);
  let parent = node.parentNode;

  for (let i = 0; parent && i < numAncestors; i++) {
    const shallowParent = cloneNodeShallow(parent);
    shallowParent.appendChild(shallowNode);
    shallowNode = shallowParent;
    parent = parent.parentNode;
  }

  return nodeToHtml(shallowNode);
};
