// export function buildSelector(
//   cues: Cue[],
//   targetElements: HTMLElement[],
//   maxPenalty?: number
// ): Selector | null {
//   const penalty = getPenalty(cues);
//   if (maxPenalty !== undefined && penalty > maxPenalty) return null;

import { batchRankCueSets } from "./generateCuesSets";
import { getTargets } from "./getTargets";
import { getXpath } from "./qawolf";
import { buildSelectorForCues, evaluatorQuerySelector } from "./selectorEngine";
import { Selector } from "./types";

//   const selector = buildSelectorForCues(cues);
//   // console.log("built selector", selector, "from cues", cues);

//   const matchedElement = evaluatorQuerySelector(
//     selector,
//     targetElements[0].ownerDocument
//   );

//   if (!matchedElement || !targetElements.includes(matchedElement)) {
//     // console.log(matchedElement, "does not match targets", targetElements);
//     return null;
//   }

//   return {
//     penalty,
//     value: selector,
//   };
// }

export function getSelector(
  target: HTMLElement,
  isClick: boolean
): Selector | null {
  const start = Date.now();

  const targets = getTargets(target, isClick);
  const targetElements = targets.map((t) => t.element);

  const cueSetGenerator = batchRankCueSets(target);

  let i = 0;
  for (const cueSet of cueSetGenerator) {
    const selector = buildSelectorForCues(cueSet.cues);
    console.debug("qawolf: evaluate selector", i++, selector);

    const matchedElement = evaluatorQuerySelector(
      selector,
      targetElements[0].ownerDocument
    );
    if (targetElements.includes(matchedElement)) {
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
