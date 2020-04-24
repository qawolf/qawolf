export { buildCssSelector, getAttributeValue } from './buildCssSelector';
export { getClickableAncestor, isClickable, isVisible } from './element';
export { formatArgument, interceptConsoleLogs } from './interceptConsoleLogs';
export { PageEventCollector } from './PageEventCollector';
export { nodeToDoc, nodeToHtml, nodeToHtmlSelector } from './serialize';
export { getXpath } from './xpath';

import * as selectorEvaluatorSource from 'playwright-core/lib/generated/selectorEvaluatorSource';
export const selectorSource = `new (${selectorEvaluatorSource.source})([])`;

import { buildCssSelector, getAttributeValue } from './buildCssSelector';
import { getClickableAncestor, isClickable, isVisible } from './element';
import { formatArgument, interceptConsoleLogs } from './interceptConsoleLogs';
import { PageEventCollector } from './PageEventCollector';
import { nodeToDoc, nodeToHtml, nodeToHtmlSelector } from './serialize';
import { getXpath } from './xpath';

const QAWolfWeb = {
  buildCssSelector,
  formatArgument,
  getAttributeValue,
  getClickableAncestor,
  getXpath,
  isClickable,
  interceptConsoleLogs,
  isVisible,
  nodeToDoc,
  nodeToHtml,
  nodeToHtmlSelector,
  PageEventCollector,
};
export type QAWolfWeb = typeof QAWolfWeb;
