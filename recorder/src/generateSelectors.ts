import { getXpath } from "./element";
import { generateSortedCueSets } from "./generateCueSets";
import { buildSelectorForCues, isSelectorMatch } from "./selectorEngine";
import { Rect, Selector } from "./types";

function getLikelyTarget(target: HTMLElement): HTMLElement {
  return (
    // XXX we may want to gate this for click actions only
    target.closest(
      "a,button,input,label,textarea,[contenteditable=true],[role=button],[role=checkbox],[role=radio]"
    ) || target
  );
}

export function getSelector(
  target: HTMLElement,
  timeout = 1000,
  selectorCache?: Map<HTMLElement, Selector>
): Selector | null {
  const start = Date.now();

  const rectCache = new Map<HTMLElement, Rect>();

  if (selectorCache && selectorCache.has(target)) {
    const selectorFromCache = selectorCache.get(target);
    const isMatch = isSelectorMatch(selectorFromCache.value, target, rectCache);
    if (isMatch) return selectorFromCache;
    selectorCache.delete(target);
  }

  const likelyTarget = getLikelyTarget(target);
  const cueSets = generateSortedCueSets(likelyTarget);

  for (const cueSet of cueSets) {
    const selector = buildSelectorForCues(cueSet.cues);

    const isMatch = isSelectorMatch(selector, likelyTarget, rectCache);
    if (isMatch) {
      const result = { penalty: cueSet.penalty, value: selector };
      if (selectorCache) {
        selectorCache.set(target, result);
        selectorCache.set(likelyTarget, result);
      }
      return result;
    }

    if (timeout > 0 && Date.now() - start > timeout) break;
  }

  return { penalty: 1000, value: getXpath(target) };
}
