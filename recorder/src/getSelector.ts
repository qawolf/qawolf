import { combine } from "./combine";
import { getCues } from "./getCues";
import { getTargets } from "./getTargets";
import { buildSelectorForCues, evaluatorQuerySelector } from "./selectorEngine";
import { getXpath } from "./serialize";
import { Cue, Selector } from "./types";

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
  // console.log("built selector", selector, "from cues", cues);

  const matchedElement = evaluatorQuerySelector(
    selector,
    targetElements[0].ownerDocument
  );

  if (!matchedElement || !targetElements.includes(matchedElement)) {
    // console.log(matchedElement, "does not match targets", targetElements);
    return null;
  }

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
  // yield 1 cue selector
  const cueSelector = buildSelector([cue], targetElements);
  if (cueSelector) yield cueSelector;

  // yield 2 cue selectors
  for (let i = 0; i < otherCues.length; i++) {
    const combinedSelector = buildSelector([cue, otherCues[i]], targetElements);
    if (combinedSelector) yield combinedSelector;
  }

  if (otherCues.length < 2) return;

  // yield 3 cue selectors
  const cueSets = combine(otherCues, 2);

  for (let k = 0; k < cueSets.length; k++) {
    // yield the selector for each combination
    const combinedSelector = buildSelector(cueSets[k], targetElements);
    if (combinedSelector) yield combinedSelector;
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

  let parent = target.parentElement;
  let level = 1;
  while (parent) {
    // introduce parent cues
    const parentCues = getCues(parent, level++);
    for (let i = 0; i < parentCues.length; i++) {
      yield* generateCueSelectors(parentCues[i], cues, targetElements);
      cues.push(parentCues[i]);
    }
    parent = target.parentElement;

    // TODO introduce target cues
  }
}

export function getSelector(
  target: HTMLElement,
  isClick: boolean,
  minTimeout: number = 100,
  maxTimeout: number = 5000
): Selector | null {
  const start = Date.now();

  const selectors = generateSelectors(target, isClick);

  let bestSelector = null;

  while (true) {
    const duration = Date.now() - start;
    if (duration > maxTimeout) break;
    else if (duration > minTimeout && bestSelector) break;

    const { done: isDone, value: selector } = selectors.next();
    if (isDone || !selector) break;

    if (!bestSelector || selector.value < bestSelector) bestSelector = selector;

    // stop if we receive a great selector
    if (bestSelector?.value === 0) return selector;
  }

  if (!bestSelector) bestSelector = { penalty: 1000, value: getXpath(target) };

  return bestSelector;
}
