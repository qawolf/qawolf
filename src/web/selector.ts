import { buildCues, buildSelectorParts, BuildCues } from './cues';
import { iterateCues } from './iterateCues';
import { getXpath } from './serialize';
import { SelectorPart, QuerySelectorAllFn } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const evaluator = require('playwright-evaluator');
const querySelectorAll: QuerySelectorAllFn = evaluator.querySelectorAll;

type IsMatch = {
  selectorParts: SelectorPart[];
  target: HTMLElement;
};

export const isMatch = ({ selectorParts, target }: IsMatch): boolean => {
  const result = querySelectorAll({ parts: selectorParts }, document.body);

  // console.debug('Try selector', selectorParts[0], selectorParts[1], target);

  if (result[0] !== target && !target.contains(result[0])) {
    // console.error('Selector matches another element');
    return false;
  }

  return true;
};

export const toSelector = (selectorParts: SelectorPart[]): string => {
  const names = selectorParts.map((s) => s.name);

  // CSS selector
  if (!names.includes('text')) {
    return selectorParts.map((s) => s.body).join(' ');
  }

  // mixed selector
  return selectorParts.map(({ body, name }) => `${name}=${body}`).join(' >> ');
};

export const buildSelector = (options: BuildCues): string => {
  const cues = buildCues(options);

  for (const cueGroup of iterateCues(cues)) {
    const selectorParts = buildSelectorParts(cueGroup);

    if (isMatch({ selectorParts, target: options.target })) {
      const selector = toSelector(selectorParts);
      return selector;
    }
  }

  return `xpath=${getXpath(options.target)}`;
};
