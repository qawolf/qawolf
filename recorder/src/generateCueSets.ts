import { combine } from "./combine";
import { getCues } from "./getCues";
import { Cue, CueSet } from "./types";

export function buildCueSet(cues: Cue[]): CueSet {
  const distance = Math.max(...cues.map((a) => Math.abs(a.level)));
  const penalty = cues.reduce((a, b) => a + b.penalty, 0);
  const valueLength = cues.reduce((a, b) => a + b.value.length, 0);

  // penalize cues by distance
  // otherwise it will try a bunch of invalid cues first
  // and run out of time before finding a match
  // if we penalize too much it will stop at a worse target selector
  const distanceFactor = 1 + Math.log(distance + 1);

  return {
    cues,
    penalty: penalty * distanceFactor,
    valueLength,
  };
}

export function compareCueSet(a: CueSet, b: CueSet): number {
  // sort by penalty
  const value = a.penalty - b.penalty;
  if (value !== 0) return value;

  // then by shortest value
  return a.valueLength - b.valueLength;
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
  if (!relativeCues.length) return;

  // combine relative with target cues
  for (let i = 0; i < relativeCues.length; i++) {
    const relativeCue = relativeCues[i];

    // yield 1 relative cue
    yield buildCueSet([relativeCue]);

    // yield 1 relative and 1 target cue
    for (let j = 0; j < targetCues.length; j++) {
      yield buildCueSet([relativeCue, targetCues[j]]);
    }

    // yield 1 relative and 2 target cues
    for (let j = 0; j < twoTargetCueSets.length; j++) {
      yield buildCueSet([relativeCue, ...twoTargetCueSets[j]]);
    }
  }

  const twoRelativeCues = combine(relativeCues, 2);
  for (let i = 0; i < twoRelativeCues.length; i++) {
    // yield 2 relative cues
    yield buildCueSet(twoRelativeCues[i]);

    // combine 2 relative and 1 target cues
    for (let j = 0; j < targetCues.length; j++) {
      yield buildCueSet([...twoRelativeCues[i], targetCues[j]]);
    }
  }

  // yield 3 relative cues
  const threeRelativeCues = combine(relativeCues, 3);
  for (let i = 0; i < threeRelativeCues.length; i++) {
    yield buildCueSet(threeRelativeCues[i]);
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
    // sometimes it yields undefined
    if (cueSet) batch.push(cueSet);

    if (batch.length >= batchSize) {
      batch.sort(compareCueSet);
      yield* batch as any;
      batch = [];
    }
  }

  batch.sort(compareCueSet);
  yield* batch as any;
}
