import { combine } from "./combine";
import { getCues } from "./getCues";
import { Cue, CueSet } from "./types";

export const buildCueSet = (cues: Cue[]): CueSet => {
  const penalty = cues.reduce((a, b) => a + b.penalty, 0);
  const valueLength = cues.reduce((a, b) => a + b.value.length, 0);
  return { cues, penalty, valueLength };
};

export function* generateCueSets(
  target: HTMLElement
): Generator<CueSet, void, unknown> {
  // yield 1 target cue sets
  const targetCues = getCues(target, 0);
  yield* targetCues.map((cue) => buildCueSet([cue])) as any;

  // yield 2 target cue sets
  const twoTargetCues = combine(targetCues, 2);
  yield* twoTargetCues.map(buildCueSet) as any;

  // yield 3 target cue sets
  const threeTargetCues = combine(targetCues, 3);
  yield* threeTargetCues.map(buildCueSet) as any;

  // TODO descendants too
  let parent = target.parentElement;
  let level = 1;
  while (parent) {
    // yield parent and target cue combinations
    const parentCues = getCues(parent, level++);
    for (let i = 0; i < parentCues.length; i++) {
      const parentCue = parentCues[i];

      for (let y = 0; y < targetCues.length; y++) {
        // yield 1 parent and 1 target combinations
        yield buildCueSet([parentCue, targetCues[y]]);

        // yield 1 parent and 2 target combinations
        yield* twoTargetCues.map((cues) =>
          buildCueSet([parentCue, ...cues])
        ) as any;
      }
    }
    // TODO 2 parent & 1 target? maybe?

    parent = target.parentElement;

    // don't go past 5 levels from the element
    // TODO make configurable
    if (level > 5) return;

    // TODO introduce target cues
  }

  // TODO this should just never stop, only be timing based....
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
