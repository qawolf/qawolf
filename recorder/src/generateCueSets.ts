import { combine } from "./combine";
import { getCues } from "./getCues";
import { Cue, CueSet } from "./types";

function compareCueSet(a: CueSet, b: CueSet): number {
  // sort by lowest penalty
  const value = a.penalty - b.penalty;
  // then by shortest value
  if (value === 0) return a.valueLength - b.valueLength;
  return value;
}

export function buildCueSet(cues: Cue[]): CueSet {
  const penalty = cues.reduce((a, b) => a + b.penalty, 0);
  const valueLength = cues.reduce((a, b) => a + b.value.length, 0);
  return { cues, penalty, valueLength };
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
  const twoTargetCueSets = combine(targetCues, 2);
  yield* twoTargetCueSets.map(buildCueSet) as any;

  // yield 3 target cue sets
  const threeTargetCues = combine(targetCues, 3);
  yield* threeTargetCues.map(buildCueSet) as any;

  const descendants = target.querySelectorAll("*");
  let level = 1;
  let ancestor = target.parentElement;
  while (level - 1 < descendants.length || ancestor) {
    // yield ancestor + target cue sets
    if (ancestor) {
      yield* generateRelativeCueSets(
        targetCues,
        twoTargetCueSets,
        ancestor,
        // negative so it is sorted higher when combined into a selector
        level * -1
      );
    }

    // yield target + descendant cue sets
    const descendant = descendants[level - 1] as HTMLElement;
    if (descendant) {
      yield* generateRelativeCueSets(
        targetCues,
        twoTargetCueSets,
        descendant,
        level
      );
    }

    if (ancestor) ancestor = ancestor.parentElement;
    level += 1;
  }
}

export function* generateRelativeCueSets(
  targetCues: Cue[],
  // pass this instead of recalculating it
  twoTargetCueSets: Cue[][],
  relative: HTMLElement,
  level: number
): Generator<CueSet, void, unknown> {
  const relativeCues = getCues(relative, level);

  const twoRelativeCues = combine(relativeCues, 2);

  // combine relative and target cues
  for (let j = 0; j < relativeCues.length; j++) {
    const relativeCue = relativeCues[j];

    // combine with each target cue
    for (let k = 0; k < targetCues.length; k++) {
      // yield 1 relative and 1 target cue
      yield buildCueSet([relativeCue, targetCues[k]]);

      // yield 1 relative and 2 target cues
      if (twoTargetCueSets.length) {
        yield* twoTargetCueSets.map((cues) =>
          buildCueSet([relativeCue, ...cues])
        ) as any;
      }

      // yield 2 relative and 1 target cues
      if (twoRelativeCues.length) {
        yield* twoRelativeCues.map((cues) => {
          buildCueSet([...cues, targetCues[k]]);
        }) as any;
      }
    }
  }
}

export function* generateSortedCueSets(
  target: HTMLElement,
  // 25 ms to generate 2000 cues on my machine
  batchSize = 2000
): Generator<CueSet, void, unknown> {
  const generator = generateCueSets(target);

  // batch then sort cues by penalty
  let batch: CueSet[] = [];
  for (const cueSet of generator) {
    batch.push(cueSet);

    if (batch.length >= batchSize) {
      batch.sort(compareCueSet);
      yield* batch as any;
      batch = [];
    }
  }

  batch.sort(compareCueSet);
  yield* batch as any;
}
