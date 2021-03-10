import { debug } from "./debug";
import { getXpath } from "./element";
import { generateSortedCueSets } from "./generateCueSets";
import { CLICK_TYPES } from "./isElementMatch";
import { buildSelectorForCues, isSelectorMatch } from "./selectorEngine";
import { Rect } from "./types";

function getLikelyTarget(target: HTMLElement): HTMLElement {
  return (
    // XXX we may want to gate this for click actions only
    target.closest(CLICK_TYPES) || target
  );
}

export function getSelector(
  target: HTMLElement,
  timeout = 1000,
  selectorCache?: Map<HTMLElement, string>
): string | null {
  const start = Date.now();

  const rectCache = new Map<HTMLElement, Rect>();

  if (selectorCache && selectorCache.has(target)) {
    const selectorFromCache = selectorCache.get(target);
    const isMatch = isSelectorMatch(selectorFromCache, target, rectCache);
    if (isMatch) return selectorFromCache;
    selectorCache.delete(target);
  }

  const likelyTarget = getLikelyTarget(target);
  const cueSets = generateSortedCueSets(likelyTarget);

  for (const cueSet of cueSets) {
    const selector = buildSelectorForCues(cueSet.cues);

    const isMatch = isSelectorMatch(selector, likelyTarget, rectCache);
    if (isMatch) {
      if (selectorCache) {
        selectorCache.set(target, selector);
        selectorCache.set(likelyTarget, selector);
      }
      debug(`found selector ${selector} for target`, target);
      return selector;
    }

    if (timeout > 0 && Date.now() - start > timeout) break;
  }

  return getXpath(target);
}
