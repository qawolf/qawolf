import { batchRankCueSets } from "./generateCuesSets";
import { getXpath } from "./qawolf";
import { buildSelectorForCues, evaluatorQuerySelector } from "./selectorEngine";
import { Selector } from "./types";

function overlap(target: HTMLElement, other: HTMLElement) {
  // TODO cache
  const rect = target.getBoundingClientRect();
  const otherRect = other.getBoundingClientRect();

  return (
    rect.top + rect.height > otherRect.top &&
    rect.left + rect.width > otherRect.left &&
    rect.bottom - rect.height < otherRect.bottom &&
    rect.right - rect.width < otherRect.right
  );
}

export function getSelector(target: HTMLElement): Selector | null {
  const start = Date.now();

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

    if (target === matchedElement || overlap(target, matchedElement)) {
      console.debug("qawolf: took", Date.now() - start);
      return { penalty: cueSet.penalty, value: selector };
    }
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
