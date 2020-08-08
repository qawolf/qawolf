import { Cue } from './cues';

type CombineCuesOptions = {
  baseGroup?: Cue[];
  lastAddedCueIndex?: number;
  minPenalty: number;
  maxPenalty: number;
};

type IterateCuesOptions = {
  penaltyRangeIncrement?: number;
};

// A larger number for INCREMENT results in less unnecessary looping
// but potentially means that a single high-penalty attribute
// will be used rather than two low-penalty attributes
const MAX_PENALTY_INCREMENT = 5;
const MAX_PENALTY_BEFORE_FALLBACK = 100;

/**
 * @summary Sorts a list of Cues by their `penalty` value, lowest penalty first.
 */
const sortCues = (cues: Cue[]): Cue[] =>
  cues.sort((a, b) => {
    // put the lower penalty at the top
    if (a.penalty < b.penalty) return -1;
    if (a.penalty > b.penalty) return 1;

    return 0;
  });

/**
 * @summary Recursive generator function that provides gradually longer
 *   cue groups within a set penalty range. The returned cue array always
 *   includes at least one cue from level 0 because the correct target
 *   can never be selected without a level 0 cue. It also never includes
 *   the same cue twice because this would not add any specificity to a
 *   selector.
 *
 *   By calling this function in a loop with increasing penalty ranges,
 *   we are able to prioritize having a low total penalty, even if that
 *   penalty is the result of multiple cues.
 */
function* combineCues(allCues: Cue[], {
  baseGroup = [],
  lastAddedCueIndex = -1,
  maxPenalty,
  minPenalty,
}: CombineCuesOptions): Generator<Cue[], void, undefined> {
  const trialGroups: Cue[][] = [];
  const baseGroupsIndexes = [];
  const baseGroups: Cue[][] = [];

  // NOTE: starting looping from lastAddedCueIndex+1 ensures we won't include
  // the same cue twice, but it also requires that we sort allCues by penalty
  // before the initial call. Otherwise some combinations will be missed.
  for (let index = lastAddedCueIndex + 1; index < allCues.length; index++) {
    const cue = allCues[index];
    const expandedGroup = [...baseGroup, cue];

    // Groups that are outside the current acceptable penalty
    // range will be tried later or were already tried.
    const totalPenalty = expandedGroup.reduce((acc, cue) => acc + cue.penalty, 0);

    if (totalPenalty < minPenalty) {
      // A group that hasn't hit the minimum penalty can be added to baseGroups
      // until we potentially hit the correct penalty range, but should not
      // be tried yet.
      baseGroups.push(expandedGroup);
      baseGroupsIndexes.push(index);
    } else if (totalPenalty > maxPenalty) {
      // We exceeded the max penalty so we shouldn't try it and there is no point
      // in adding it to baseGroups.
    } else {
      // We're in the current penalty range. Try the group and add it to baseGroups
      // for further expansion.
      baseGroups.push(expandedGroup);
      baseGroupsIndexes.push(index);

      // Groups that have no level=0 cues are useless
      const level0Cue = expandedGroup.find((cue) => cue.level === 0);
      if (level0Cue) trialGroups.push(expandedGroup);
    }
  }

  yield* trialGroups;

  for (let index = 0; index < baseGroups.length; index++) {
    yield* combineCues(allCues, {
      baseGroup: baseGroups[index],
      lastAddedCueIndex: baseGroupsIndexes[index],
      maxPenalty,
      minPenalty,
    });
  }
}

/**
 * @summary Iterates through all possible groups (combinations) of cues, in such an order
 *   as to hopefully provide the best short, readable, and unique selector as quickly as possible.
 * @param {Object[]} cues The list of all cues, in any order.
 * @param {Object} [options] Options
 * @param {Object} [options.penaltyRangeIncrement=5] A higher value means a greater chance
 *   that higher penalty groups are returned before lower penalty groups, but a lower value
 *   potentially does a lot more unnecessary looping. The value must be 1 or greater, and a
 *   value of 1, although slowest, ensures results are 100% sorted in total penalty order.
 *   Values above 1 cause the penalty sorting to be increasingly fuzzy.
 */
export function* iterateCues(cues: Cue[], options?: IterateCuesOptions): Generator<Cue[], void, undefined> {
  const {
    penaltyRangeIncrement = MAX_PENALTY_INCREMENT
  } = options || {};

  const cuesSortedByPenalty = sortCues(cues);

  let minPenalty = 0;
  let maxPenalty = 0;
  do {
    yield* combineCues(cuesSortedByPenalty, { minPenalty, maxPenalty });
    minPenalty = maxPenalty + 1;
    maxPenalty = maxPenalty + penaltyRangeIncrement;
  } while (maxPenalty <= MAX_PENALTY_BEFORE_FALLBACK);
}
