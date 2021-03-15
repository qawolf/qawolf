import { debug } from "./debug";
import { getXpath } from "./element";
import { generateSortedCueSets } from "./generateCueSets";
import { CLICK_TYPES } from "./isElementMatch";
import { buildSelectorForCues, isSelectorMatch } from "./selectorEngine";
import { RankedSelector, Rect } from "./types";

function getLikelyTarget(target: HTMLElement): HTMLElement {
  return (
    // XXX we may want to gate this for click actions only
    target.closest(CLICK_TYPES) || target
  );
}

export function* generateSelectors(
  target: HTMLElement,
  timeout = 1000,
  selectorCache?: Map<HTMLElement, RankedSelector>
): Generator<RankedSelector, void, unknown> {
  const start = Date.now();

  const rectCache = new Map<HTMLElement, Rect>();

  if (selectorCache && selectorCache.has(target)) {
    const rankedSelector = selectorCache.get(target);
    const isMatch = isSelectorMatch(rankedSelector.selector, target, rectCache);
    if (isMatch) {
      yield rankedSelector;
    } else {
      // delete from cache if not a match
      selectorCache.delete(target);
    }
  }

  const likelyTarget = getLikelyTarget(target);
  const cueSets = generateSortedCueSets(likelyTarget);

  let count = 0;

  for (const cueSet of cueSets) {
    const selector = buildSelectorForCues(cueSet.cues);

    const isMatch = isSelectorMatch(selector, likelyTarget, rectCache);
    if (isMatch) {
      const rankedSelector = { penalty: cueSet.penalty, selector };
      debug(`found selector ${selector} for target`, target);
      if (selectorCache) {
        selectorCache.set(target, rankedSelector);
        selectorCache.set(likelyTarget, rankedSelector);
      }
      yield rankedSelector;
      count += 1;
    }

    if (timeout > 0 && Date.now() - start > timeout) break;
  }

  if (count < 1) yield { penalty: 1000, selector: getXpath(target) };
}

export function getSelector(
  target: HTMLElement,
  timeout = 1000,
  selectorCache?: Map<HTMLElement, RankedSelector>
): string {
  const selectors = generateSelectors(target, timeout, selectorCache);

  for (const selector of selectors) {
    // take the first one
    return selector.selector;
  }
}
