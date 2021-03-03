import { combine } from "./combine";
import { getCues } from "./getCues";
import { getTargets } from "./getTargets";
import { buildSelectorForCues, evaluatorQuerySelector } from "./selectorEngine";
import { getXpath } from "./serialize";
import { Cue, Selector, Target } from "./types";

export const getPenalty = (cues: Cue[]): number => {
  return cues.reduce((a, b) => a + b.penalty, 0);
};

export function buildSelector(
  cues: Cue[],
  targetElements: HTMLElement[],
  maxPenalty?: number
): Selector | null {
  const penalty = getPenalty(cues);
  if (maxPenalty !== undefined && penalty > maxPenalty) return null;

  const selector = buildSelectorForCues(cues);
  const matchedElement = evaluatorQuerySelector(
    selector,
    targetElements[0].ownerDocument
  );
  if (!targetElements.includes(matchedElement)) return null;

  return {
    penalty,
    value: selector,
  };
}

export function* generateCueSelectors(
  cue: Cue,
  otherCues: Cue[],
  targetElements: HTMLElement[]
): Generator<Selector, void, unknown> {
  // yield the selector for the individual cue
  const cueSelector = buildSelector([cue], targetElements);
  if (cueSelector) yield cueSelector;

  // max cue set is 3 cues (cue with 2 others)
  // the selector is bad if we need more than that
  for (let size = 1; size < otherCues.length && size < 2; size++) {
    const cueSets = combine(otherCues, size);

    for (let k = 0; k < cueSets.length; k++) {
      // yield the selector for each combination
      const combinedSelector = buildSelector(cueSets[k], targetElements);
      if (combinedSelector) yield combinedSelector;
    }
  }
}

export function* generateSelectors(
  target: HTMLElement,
  isClick: boolean
): Generator<Selector, void, unknown> {
  const targets = getTargets(target, isClick);
  const targetElements = targets.map((t) => t.element);

  const cues = getCues(target, 0);

  // TODO include nearest preferred attribute

  // generate selectors for each cue, ordered by penalty
  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    const otherCues = [...cues.slice(0, i), ...cues.slice(i + 1)];
    yield* generateCueSelectors(cue, otherCues, targetElements);
  }

  // introduce cues from targets & ancestors
}

export function getSelector(
  target: HTMLElement,
  isClick: boolean,
  minTimeout: number = 100,
  maxTimeout: number = 500
): Selector | null {
  const start = Date.now();

  const selectors = generateSelectors(target, isClick);

  let bestSelector = null;

  while (true) {
    const time = Date.now() - start;

    if (time > maxTimeout) break;
    else if (time > minTimeout && bestSelector) break;

    const { done: isDone, value: selector } = selectors.next();
    if (isDone || !selector) break;

    if (!bestSelector || selector.value < bestSelector) bestSelector = selector;
  }

  if (!bestSelector) bestSelector = { penalty: 1000, value: getXpath(target) };

  return bestSelector;
}
