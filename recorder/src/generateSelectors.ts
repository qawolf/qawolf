import { debug } from "./debug";
import { getXpath } from "./element";
import { generateSortedCueSets } from "./generateCueSets";
import { isMatch, Rect } from "./isMatch";
import { buildSelectorForCues, evaluatorQuerySelector } from "./selectorEngine";
import { Selector } from "./types";

function getLikelyTarget(target: HTMLElement): HTMLElement {
  return (
    target.closest(
      "a,button,label,[role=button],[role=checkbox],[role=radio]"
    ) || target
  );
}

export function getSelector(
  element: HTMLElement,
  timeout = 1000
): Selector | null {
  const start = Date.now();

  const rectCache = new Map<HTMLElement, Rect>();

  const target = getLikelyTarget(element);
  const cueSets = generateSortedCueSets(target);

  for (const cueSet of cueSets) {
    const selector = buildSelectorForCues(cueSet.cues);

    const matchedElement = evaluatorQuerySelector(
      selector,
      // We must pass `target.ownerDocument` rather than `document`
      // because sometimes this is called from other frames.
      target.ownerDocument
    );

    debug(
      "selector",
      selector,
      "evaluated  to",
      matchedElement,
      "cues",
      cueSet.cues
    );

    if (matchedElement && isMatch(matchedElement, target, rectCache)) {
      return { penalty: cueSet.penalty, value: selector };
    }

    if (timeout > 0 && Date.now() - start > timeout) break;
  }

  return { penalty: 1000, value: getXpath(target) };
}
