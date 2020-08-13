import { buildCues, BuildCues } from './cues';
import { optimizeCues } from './optimizeCues';
import { getXpath } from './serialize';
import { isMatch } from './selectorParts';
import { SelectorPart } from './types';

const selectorCache = new Map<HTMLElement, SelectorPart[]>();
const clickSelectorCache = new Map<HTMLElement, SelectorPart[]>();

/**
 * @summary Clear the selector cache. Currently only used for tests.
 */
export const clearSelectorCache = (): void => {
  selectorCache.clear();
  clickSelectorCache.clear();
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

  const { selectorParts } = optimizeCues(cues, target) || {};
  if (selectorParts) {
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
  } else {
    // No selector was found, fall back to xpath.
    selector = `xpath=${getXpath(target)}`;
  }

  // console.debug('Built selector', selector, 'for target', target);
  return selector;
};
