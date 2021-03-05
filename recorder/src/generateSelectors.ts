import { debug } from "./debug";
import { generateSortedCueSets } from "./generateCueSets";
import { getXpath } from "./qawolf";
import { buildSelectorForCues, evaluatorQuerySelector } from "./selectorEngine";
import { Selector } from "./types";

// TODO move to match...
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
  timeout = 1000
): Selector | null {
  const start = Date.now();

  const target = getLikelyTarget(element);

  const cueSets = generateSortedCueSets(target);

  let i = 0;
  for (const cueSet of cueSets) {
    const selector = buildSelectorForCues(cueSet.cues);
    debug("evaluate selector", i++, selector);

    const startEvaluate = Date.now();
    const matchedElement = evaluatorQuerySelector(
      selector,
      // We must pass `target.ownerDocument` rather than `document`
      // because sometimes this is called from other frames.
      target.ownerDocument
    );
    debug("evaluate took", Date.now() - startEvaluate);

    if (isMatch(target, matchedElement)) {
      debug("getSelector took", Date.now() - start);
      return { penalty: cueSet.penalty, value: selector };
    }

    if (timeout > 0 && Date.now() - start > timeout) break;
  }

  return { penalty: 1000, value: getXpath(target) };
}
