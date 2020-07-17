import { Cue } from './cues';

type CombineCuesOptions = {
  minPenalty: number;
  maxPenalty: number;
  startingGroup?: Cue[];
  startingGroupIndexes?: number[];
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
  minPenalty,
  maxPenalty,
  startingGroup = [],
  startingGroupIndexes = []
}: CombineCuesOptions): Generator<Cue[], void, undefined> {
  const trialGroups = [];
  const trialGroupsIndexes = [];

  for (let index = 0; index < allCues.length; index++) {
    // There is never any reason to add a cue twice to the same group
    if (startingGroupIndexes.includes(index)) continue;

    const cue = allCues[index];
    const expandedGroup = [...startingGroup, cue];

    // Groups that have no level=0 cues are useless
    const level0Cue = expandedGroup.find((cue) => cue.level === 0);
    if (!level0Cue) continue;

    // Groups that are outside the current acceptable penalty
    // range will be tried later or were already tried.
    const totalPenalty = expandedGroup.reduce((acc, cue) => acc + cue.penalty, 0);
    if (totalPenalty > maxPenalty || totalPenalty < minPenalty) continue;

    trialGroups.push(expandedGroup);
    trialGroupsIndexes.push([...startingGroupIndexes, index]);
  }

  yield* trialGroups;

  for (let index = 0; index < trialGroups.length; index++) {
    const trialGroup = trialGroups[index];
    const trialGroupIndexes = trialGroupsIndexes[index];
    yield* combineCues(allCues, {
      minPenalty,
      maxPenalty,
      startingGroup: trialGroup,
      startingGroupIndexes: trialGroupIndexes,
    });
  }
}

export function* iterateCues(cues: Cue[]): Generator<Cue[], void, undefined> {
  const cuesSortedByPenalty = sortCues(cues);

  let minPenalty = 0;
  let maxPenalty = 0;
  do {
    yield* combineCues(cuesSortedByPenalty, { minPenalty, maxPenalty });
    minPenalty = maxPenalty + 1;
    maxPenalty = maxPenalty + MAX_PENALTY_INCREMENT;
  } while (maxPenalty <= MAX_PENALTY_BEFORE_FALLBACK);
}
