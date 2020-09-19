import {
  Cue,
  findNearestPreferredAttributeCue,
  getPenalty,
  getValueLength,
} from './cues';
import { buildSelectorParts, getElementMatchingSelectorParts, isMatch } from './selectorEngine';
import { SelectorPart } from './types';

export type CueGroup = {
  cues: Cue[];
  penalty: number;
  selectorParts: SelectorPart[];
  valueLength: number;
};

export type OnFoundFn = (cueGroup: CueGroup) => void;

export type FindOptimalCueGroupsInput = {
  cues: Cue[];
  onFound: OnFoundFn;
  target: HTMLElement;
  targetGroup: HTMLElement[];
};

type CueLevel = {
  css: Cue[];
  text: Cue[];
};

const TRIM_EXCESS_CUES_GOAL_SIZE = 8;
const CUE_GROUP_CUES_MAX_SIZE = 10;
const FINAL_CUE_GROUP_MAX_SIZE = 3;

/**
 * Build the cue sets.
 * There are multiple since each level of cues
 * can only have one type per level (css/text).
 */
export const buildCueSets = (cues: Cue[]): Cue[][] => {
  const cueLevels = new Map<number, CueLevel>();

  // Group cues into levels.
  cues.forEach((cue) => {
    const cueLevel = cueLevels.has(cue.level)
      ? cueLevels.get(cue.level)
      : { css: [], text: [] };

    if (cue.type === 'text') {
      cueLevel.text.push(cue);
    } else {
      cueLevel.css.push(cue);
    }

    cueLevels.set(cue.level, cueLevel);
  });

  let cueSets: Cue[][] = [];

  const levels = [...cueLevels.keys()].sort((a, b) => b - a);
  levels.forEach((level) => {
    const cueLevel = cueLevels.get(level);

    const cueSetsWithLevel: Cue[][] = [];

    // Append the level to each cue set
    // keeping css and text cues separate.
    cueSets.forEach((cueSet) => {
      if (cueLevel.css.length) {
        cueSetsWithLevel.push([...cueSet, ...cueLevel.css]);
      }

      if (cueLevel.text.length) {
        cueSetsWithLevel.push([...cueSet, ...cueLevel.text]);
      }
    });

    if (!cueSets.length) {
      // Create the first cue sets.
      if (cueLevel.css.length) {
        cueSetsWithLevel.push([...cueLevel.css]);
      }

      if (cueLevel.text.length) {
        cueSetsWithLevel.push([...cueLevel.text]);
      }
    }

    cueSets = cueSetsWithLevel;
  });

  return cueSets;
};

const doCombine = <T>(
  items: T[],
  remaining: number,
  combination: T[],
  result: T[][],
) => {
  if (remaining === 0) {
    if (combination.length > 0) {
      result.push(combination);
    }
    return;
  }

  // For each item
  for (let i = 0; i < items.length; i++) {
    doCombine(
      // Combine the later items
      items.slice(i + 1),
      // Recursively add items until we reach the correct size
      remaining - 1,
      // Include the item in the selection
      combination.concat([items[i]]),
      result,
    );
  }
  return;
};

/**
 * Build all combinations of items with the specified size.
 */
export const combine = <T>(items: T[], size: number): T[][] => {
  const result = [];

  doCombine(items, size, [], result);

  return result;
};

export const sortCues = (cues: Cue[]): Cue[] => {
  return [...cues].sort((a, b) => {
    // Sort by level
    if (a.level < b.level) return 1;
    if (a.level > b.level) return -1;

    // Then by penalty
    if (a.penalty < b.penalty) return 1;
    if (a.penalty > b.penalty) return -1;

    // Then by the value length
    if (a.value.length < b.value.length) return 1;
    if (a.value.length > b.value.length) return -1;

    return 0;
  });
};

// Remove cues that are not necessary to target the element
// until we get to a size that we can try all combinations of
export const trimExcessCues = (
  cuesToTrim: Cue[],
  target: HTMLElement,
  goalSize: number,
): CueGroup | null => {
  let selectorParts = buildSelectorParts(cuesToTrim);

  if (!isMatch({ selectorParts, target })) {
    // Short-circuit if the cues do not match the target
    // This should never happen but we are being precautious
    console.debug('qawolf: selectors did not match', selectorParts, target);
    return null;
  }

  // Remove the cues furthest away from the target first
  let cues = sortCues(cuesToTrim);

  for (let i = 0; i < cues.length && cues.length > goalSize; i++) {
    // Keep preferred attribute cues even if they are unnecessary
    if (cues[i].penalty === 0) continue;

    const cuesWithoutI = [...cues];
    cuesWithoutI.splice(i, 1);

    const selectorPartsWithoutI = buildSelectorParts(cuesWithoutI);

    if (isMatch({ selectorParts: selectorPartsWithoutI, target })) {
      cues = cuesWithoutI;
      selectorParts = selectorPartsWithoutI;
      i -= 1;
    }
  }

  return {
    cues,
    penalty: getPenalty(cues),
    selectorParts,
    valueLength: getValueLength(cues),
  };
};

// Go through every combination of cues from 1..max size
// Pick the cues that match the target with the lowest penalty
export const findBestCueGroup = (
  seedGroup: CueGroup,
  maxSize: number,
  targetGroup: HTMLElement[],
): CueGroup => {
  let bestGroup = seedGroup;

  // Keep the nearest attribute
  const cueToKeep = findNearestPreferredAttributeCue(seedGroup.cues);

  for (let i = 1; i <= maxSize; i++) {
    const combinations = combine(seedGroup.cues, i);

    combinations.forEach((cues: Cue[]) => {
      const penalty = getPenalty(cues);

      // Skip these cues if they are not better
      if (penalty > bestGroup.penalty) return;

      const valueLength = getValueLength(cues);

      if (penalty === bestGroup.penalty) {
        if (bestGroup.cues.length < cues.length) return;

        if (
          bestGroup.cues.length === cues.length &&
          valueLength >= bestGroup.valueLength
        )
          return;
      }

      if (cueToKeep && !cues.includes(cueToKeep)) {
        cues.push(cueToKeep);
      }

      const selectorParts = buildSelectorParts(cues);

      // If these selector parts match any element that we are targeting,
      // then it's currently the best group.
      const matchedElement = getElementMatchingSelectorParts(selectorParts, targetGroup[0].ownerDocument);
      if (targetGroup.includes(matchedElement)) {
        bestGroup = {
          cues,
          penalty,
          selectorParts,
          valueLength,
        };
        // I considered breaking out of the loop here if penalty is 0, but then we would
        // not find other 0-penalty groups that might have a shorter value. We could
        // consider breaking out if `penalty` is 0 and `valueLength` is "low enough"
      }
    });
  }

  return bestGroup;
};

export const findOptimalCueGroups = (input: FindOptimalCueGroupsInput): void => {
  const { cues, onFound, target, targetGroup } = input;

  const cueSets = buildCueSets(cues);

  for (let index = 0; index < cueSets.length; index++) {
    // Only use the first 50 cue sets (there should never be this many, usually just ~2-3)
    if (index > 49) break;

    const cueSet = cueSets[index];

    // Trim down the cue group before exhaustively trying the combinations
    const cueGroup = trimExcessCues(cueSet, target, TRIM_EXCESS_CUES_GOAL_SIZE);

    // Skip if we cannot trim the group (this should rarely happen)
    // Then exhaustively try all combinations
    if (cueGroup && cueGroup.cues.length <= CUE_GROUP_CUES_MAX_SIZE) {
      onFound(findBestCueGroup(cueGroup, FINAL_CUE_GROUP_MAX_SIZE, targetGroup));
    }
  }
};

/**
 * @summary Given a list of cue groups, picks the one with the lowest total penalty
 *   and lowest total value length. That is, the one that is likely to produce the
 *   shortest and most accurate selector.
 */
export const pickBestCueGroup = (cueGroups: CueGroup[]): CueGroup | null => {
  let bestCueGroup: CueGroup;

  if (cueGroups.length === 0) return null;

  // Rank by the total penalty then by value length. This will take less
  // time than .sort and will not mutate the cueGroups array.
  for (const cueGroup of cueGroups) {
    if (
      !bestCueGroup ||
      cueGroup.penalty < bestCueGroup.penalty ||
      (cueGroup.penalty === bestCueGroup.penalty && cueGroup.valueLength < bestCueGroup.valueLength)
    ) {
      bestCueGroup = cueGroup;
    }
  }

  return bestCueGroup;
};
