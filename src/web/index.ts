export { buildCssSelector, getAttributeValue } from './buildCssSelector';
export { getClickableAncestor, isClickable, isVisible } from './element';
export { PageEventCollector } from './PageEventCollector';
export { nodeToDoc, nodeToHtml, nodeToHtmlSelector } from './serialize';
export { getXpath } from './xpath';

import { buildCssSelector, getAttributeValue } from './buildCssSelector';
import { getClickableAncestor, isClickable, isVisible } from './element';
import { PageEventCollector } from './PageEventCollector';
import { nodeToDoc, nodeToHtml, nodeToHtmlSelector } from './serialize';
import { getXpath } from './xpath';

const QAWolfWeb = {
  buildCssSelector,
  getAttributeValue,
  getClickableAncestor,
  getXpath,
  isClickable,
  isVisible,
  nodeToDoc,
  nodeToHtml,
  nodeToHtmlSelector,
  PageEventCollector,
};
export type QAWolfWeb = typeof QAWolfWeb;
