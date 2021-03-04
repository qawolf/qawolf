import { batchRankCueSets } from "./generateCuesSets";
import { getXpath } from "./qawolf";
import { buildSelectorForCues, evaluatorQuerySelector } from "./selectorEngine";
import { Selector } from "./types";

const ALLOW_CHILDREN_TARGETS = new Set([
  "button",
  "checkbox",
  "image",
  "radio",
  "reset",
  "submit",
]);

function canContain(target: HTMLElement) {
  if (target.isContentEditable) return false;
  if (target.tagName !== "INPUT") return true;
  return ALLOW_CHILDREN_TARGETS.has((target as HTMLInputElement).type);
}

function getLikelyTarget(target: HTMLElement): HTMLElement {
  return (
    target.closest(
      "a,button,input,label,select,[role=button],[role=checkbox],[role=radio]"
    ) || target
  );
}

/**
 * Check the target contains the middle point of the element
 */
function contains(target: DOMRect, element: DOMRect) {
  const elementMiddleX = element.x + element.width / 2;
  const elementMiddleY = element.y + element.height / 2;

  return (
    target.x <= elementMiddleX &&
    elementMiddleX <= target.x + target.width &&
    target.y <= elementMiddleY &&
    elementMiddleY <= target.y + target.height
  );
}

function isMatch(target: HTMLElement, element: HTMLElement) {
  if (!element) return false;
  if (element === target) return true;

  if (!canContain(target)) return false;

  return (
    // check the target contains the element
    contains(target.getBoundingClientRect(), element.getBoundingClientRect()) &&
    // make sure the elements in are in the same tree
    // ex. a modal might be on top but we don't want
    // to consider the element behind it as matches
    (target.contains(element) || element.contains(target))
  );
}

export function getSelector(
  element: HTMLElement,
  timeout = 500
): Selector | null {
  const start = Date.now();

  const target = getLikelyTarget(element);

  const cueSetGenerator = batchRankCueSets(target);

  let i = 0;
  for (const cueSet of cueSetGenerator) {
    const selector = buildSelectorForCues(cueSet.cues);
    console.debug("qawolf: evaluate selector", i++, selector);

    const startEvaluate = Date.now();
    const matchedElement = evaluatorQuerySelector(
      selector,
      target.ownerDocument
    );
    console.debug("qawolf: evaluate took", Date.now() - startEvaluate);

    if (isMatch(target, matchedElement)) {
      console.debug("qawolf: took", Date.now() - start);
      return { penalty: cueSet.penalty, value: selector };
    }

    if (Date.now() - start > timeout) break;
  }

  // while (true) {
  //   if (duration > maxTimeout) break;
  //   else if (duration > minTimeout && bestSelector) break;

  //   const { done: isDone, value: selector } = selectors.next();
  //   if (isDone || !selector) break;

  //   if (!bestSelector || selector.value < bestSelector) bestSelector = selector;

  //   // stop if we receive a great selector
  //   if (bestSelector?.value === 0) return selector;
  // }

  return { penalty: 1000, value: getXpath(target) };
}
