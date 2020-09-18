import {
  buildCues,
  BuildCues,
} from './cues';
import { getClickableGroup } from './element';
import { buildCueSets, CueGroup, optimizeCues, pickBestCueGroup } from './optimizeCues';
import { getXpath } from './serialize';
import { getElementMatchingSelectorParts, isMatch } from './selectorEngine';
import { SelectorPart } from './types';

type CachedSelectorInfo = {
  matchedTarget: HTMLElement;
  selector: string;
  selectorParts: SelectorPart[];
};

const selectorCache = new Map<HTMLElement, CachedSelectorInfo>();
const clickSelectorCache = new Map<HTMLElement, CachedSelectorInfo>();

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
  let cachedSelectorInfo: CachedSelectorInfo;
  if (isClick) {
    cachedSelectorInfo = clickSelectorCache.get(target);
  } else {
    cachedSelectorInfo = selectorCache.get(target);
  }

  let selector: string;
  if (cachedSelectorInfo) {
    const { matchedTarget, selector, selectorParts } = cachedSelectorInfo;
    // Even if we have cached a selector, it is possible that the DOM
    // has changed since the cached one was built. Confirm it's a match.
    if (isMatch({ selectorParts, target: matchedTarget })) {
      // console.debug('Using cached selector', selector, 'for target', target);
      return selector;
    }
  }

  let targetGroup: HTMLElement[];
  if (isClick) {
    targetGroup = getClickableGroup(target);
    if (targetGroup.length === 0) targetGroup = [target];
  } else {
    targetGroup = [target];
  }

  const cueGroups: CueGroup[] = [];

  targetGroup.forEach((targetElement) => {
    const cues = buildCues({ ...options, target: targetElement });
    const cueSets = buildCueSets(cues);
    cueGroups.push(
      ...optimizeCues(cueSets, targetElement, targetGroup)
    );
  });

  const { selectorParts } = pickBestCueGroup(cueGroups) || {};
  if (selectorParts) {
    // Now convert selectorParts (a Playwright thing) to a string selector
    selector = toSelector(selectorParts);

    // This selector should match one of the elements in `targetGroup`, but it
    // may not be the original target. If so, determine what the matched target is.
    let matchedTarget: HTMLElement;
    if (targetGroup.length === 1 && targetGroup[0] === target) {
      matchedTarget = target;
    } else {
      // We must pass `target.ownerDocument` rather than `document`
      // because sometimes this is called from other frames.
      matchedTarget = getElementMatchingSelectorParts(selectorParts, target.ownerDocument);
    }

    // Cache it so that we don't need to do all the looping for this
    // same target next time. We cache `selectorParts` along with `selector`
    // because the DOM can change, so when we later use the cached selector,
    // we will need to run it through `isMatch` again, which needs the parsed
    // selector.
    const selectorInfo: CachedSelectorInfo = {
      matchedTarget,
      selector,
      selectorParts,
    };
    if (isClick) {
      clickSelectorCache.set(target, selectorInfo);
    } else {
      selectorCache.set(target, selectorInfo);
    }
  } else {
    // No selector was found, fall back to xpath.
    selector = `xpath=${getXpath(target)}`;
  }

  // console.debug('Built selector', selector, 'for target', target);
  return selector;
};
