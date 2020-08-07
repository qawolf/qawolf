import { buildCues, buildSelectorParts, BuildCues } from './cues';
import { iterateCues } from './iterateCues';
import { getXpath } from './serialize';
import { Evaluator, SelectorPart } from './types';

/* eslint-disable @typescript-eslint/no-var-requires */
const {
  isVisible,
  querySelectorAll,
}: Evaluator = require('playwright-evaluator');
/* eslint-enable @typescript-eslint/no-var-requires */

type IsMatch = {
  selectorParts: SelectorPart[];
  target: HTMLElement;
};

const selectorCache = new Map<HTMLElement, SelectorPart[]>();
const clickSelectorCache = new Map<HTMLElement, SelectorPart[]>();

/**
 * @summary Clear the selector cache. Currently only used for tests.
 */
export const clearSelectorCache = (): void => {
  selectorCache.clear();
  clickSelectorCache.clear();
};

export const isMatch = ({ selectorParts, target }: IsMatch): boolean => {
  const result = querySelectorAll(
    { parts: selectorParts },
    document,
  ).filter((element) => isVisible(element));

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
  const { isClick, target } = options;

  // To save looping, see if we have already figured out a unique
  // selector for this target.
  let cachedSelectorParts: SelectorPart[];
  if (isClick) {
    cachedSelectorParts = clickSelectorCache.get(target);
  } else {
    cachedSelectorParts = selectorCache.get(target);
  }

  let selector: string;
  if (cachedSelectorParts) {
    // Even if we have cached a selector, it is possible that the DOM
    // has changed since the cached one was built. Confirm it's a match.
    if (isMatch({ selectorParts: cachedSelectorParts, target })) {
      selector = toSelector(cachedSelectorParts);
      // console.debug('Using cached selector', selector, 'for target', target);
      return selector;
    }
  }

  const cues = buildCues(options);

  // iterateCues will dynamically figure out increasingly
  // complex cue groups to suggest
  for (const cueGroup of iterateCues(cues)) {
    const selectorParts = buildSelectorParts(cueGroup);

    // If the suggested cue group matches this target and no others, use it.
    if (isMatch({ selectorParts, target })) {
      // First cache it so that we don't need to do all the looping for this
      // same target next time. We cache `selectorParts` rather than `selector`
      // because the DOM can change, so when we later use the cached selector,
      // we will need to run it through `isMatch` again, which needs the parsed
      // selector.
      if (isClick) {
        clickSelectorCache.set(target, selectorParts);
      } else {
        selectorCache.set(target, selectorParts);
      }

      // Now convert selectorParts (a Playwright thing) to a string selector
      selector = toSelector(selectorParts);
      break;
    }
  }

  // If no selector was unique, fall back to xpath.
  if (!selector) {
    selector = `xpath=${getXpath(target)}`;
  }

  // console.debug('Built selector', selector, 'for target', target);
  return selector;
};
