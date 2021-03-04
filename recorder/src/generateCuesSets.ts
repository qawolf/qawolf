import { combine } from "./combine";
import { getCues } from "./getCues";
import { Cue, CueSet } from "./types";

export const buildCueSet = (cues: Cue[]): CueSet => {
  const penalty = cues.reduce((a, b) => a + b.penalty, 0);
  const valueLength = cues.reduce((a, b) => a + b.value.length, 0);
  return { cues, penalty, valueLength };
};

export function* generateMultiLevelCues(
  targetCues: Cue[],
  twoTargetCues: Cue[][],
  relative: HTMLElement,
  level: number
): Generator<CueSet, void, unknown> {
  // yield relative and target cue combinations
  const relativeCues = getCues(relative, level);

  for (let j = 0; j < relativeCues.length; j++) {
    const relativeCue = relativeCues[j];

    const twoRelativeCues = combine(relativeCues, 2);

    for (let k = 0; k < targetCues.length; k++) {
      // yield 1 relative and 1 target combinations
      yield buildCueSet([relativeCue, targetCues[k]]);

      // yield 1 relative and 2 target combinations
      yield* twoTargetCues.map((cues) =>
        buildCueSet([relativeCue, ...cues])
      ) as any;

      // yield 2 relative and 1 target combinations
      yield* twoRelativeCues.map((cues) => {
        buildCueSet([...cues, targetCues[k]]);
      }) as any;
    }
  }
}

export function* generateCueSets(
  target: HTMLElement
): Generator<CueSet, void, unknown> {
  // yield 1 target cue sets
  let targetCues = getCues(target, 0);
  yield* targetCues.map((cue) => buildCueSet([cue])) as any;

  // do not combine text cues because they are very expensive to evaluate
  targetCues = targetCues.filter((c) => c.type !== "text");

  // yield 2 target cue sets
  const twoTargetCues = combine(targetCues, 2);
  yield* twoTargetCues.map(buildCueSet) as any;

  // yield 3 target cue sets
  const threeTargetCues = combine(targetCues, 3);
  yield* threeTargetCues.map(buildCueSet) as any;

  const descendants = target.querySelectorAll("*");

  let level = 1;
  let parent = target.parentElement;
  while (level - 1 < descendants.length || parent) {
    if (parent)
      yield* generateMultiLevelCues(
        targetCues,
        twoTargetCues,
        parent,
        // negative so it is sorted higher when combined into a selector
        level * -1
      );

    const descendant = descendants[level - 1] as HTMLElement;
    if (descendant)
      yield* generateMultiLevelCues(
        targetCues,
        twoTargetCues,
        descendant,
        level
      );

    if (parent) parent = parent.parentElement;
    level += 1;
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
