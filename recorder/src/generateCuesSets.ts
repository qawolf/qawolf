import { combine } from "./combine";
import { getCues } from "./getCues";
import { Cue, CueSet } from "./types";

export const buildCueSet = (cues: Cue[]): CueSet => {
  const penalty = cues.reduce((a, b) => a + b.penalty, 0);
  const valueLength = cues.reduce((a, b) => a + b.value.length, 0);
  return { cues, penalty, valueLength };
};

export function* combineCues(
  cue: Cue,
  otherCues: Cue[]
): Generator<CueSet, void, unknown> {
  // yield 2 cue selectors
  for (let i = 0; i < otherCues.length; i++) {
    const otherCue = otherCues[i];
    yield buildCueSet([cue, otherCue]);
  }

  // yield 3 cue selectors
  if (otherCues.length > 1) {
    const cueSets = combine(otherCues, 2);
    yield* cueSets.map((s) => buildCueSet(s)) as any;
  }
}

export function* generateCueSets(
  target: HTMLElement
): Generator<CueSet, void, unknown> {
  const targetCues = getCues(target, 0);

  // generate target cue combinations
  for (let i = 0; i < targetCues.length; i++) {
    const cue = targetCues[i];
    // yield 1 cue selector
    yield buildCueSet([cue]);

    const otherCues = [...targetCues.slice(0, i), ...targetCues.slice(i + 1)];
    yield* combineCues(cue, otherCues);
  }

  let parent = target.parentElement;
  let level = 1;
  while (parent) {
    // generate parent and target cue combinations
    const parentCues = getCues(parent, level++);
    for (let i = 0; i < parentCues.length; i++) {
      yield* combineCues(parentCues[i], targetCues);
    }
    parent = target.parentElement;

    // don't go past 5 levels from the element
    // TODO make configurable
    if (level > 5) return;

    // TODO introduce target cues
  }
}

/**
 * Batch and rank cue sets
 */
export function* batchRankCueSets(
  target: HTMLElement,
  // 25 ms to generate 2000 cues on my machine
  batchSize = 2000
): Generator<CueSet, void, unknown> {
  const generator = generateCueSets(target);

  let start = Date.now();

  let batch: CueSet[] = [];
  for (const cueSet of generator) {
    batch.push(cueSet);

    if (batch.length >= batchSize) {
      batch.sort(compareCueSet);
      yield* batch as any;
      batch = [];
      start = Date.now();
    }
  }

  batch.sort(compareCueSet);
  yield* batch as any;
}

const compareCueSet = (a: CueSet, b: CueSet): number => {
  const value = a.penalty - b.penalty;

  if (value === 0) {
    return a.valueLength - b.valueLength;
  }

  return value;
};
