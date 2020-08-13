import {
  Cue,
  findNearestPreferredAttributeCue,
  getPenalty,
  getValueLength,
} from './cues';
import { buildSelectorParts, isMatch } from './selectorEngine';
import { SelectorPart } from './types';

type CueGroup = {
  cues: Cue[];
  penalty: number;
  selectorParts: SelectorPart[];
  valueLength: number;
};

type CueLevel = {
  css: Cue[];
  text: Cue[];
};

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
    console.log('selectors did not match', selectorParts, target);
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
  target: HTMLElement,
  maxSize: number,
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

      if (isMatch({ selectorParts, target })) {
        bestGroup = {
          cues,
          penalty,
          selectorParts,
          valueLength,
        };
      }
    });
  }

  return bestGroup;
};

export const optimizeCues = (
  cues: Cue[],
  target: HTMLElement,
): CueGroup | null => {
  const cueSets = buildCueSets(cues);

  const cueGroups = cueSets
    .map((cueSet) => {
      // Trim down the cue group to 8
      const trimmedCues = trimExcessCues(cueSet, target, 8);
      if (!trimmedCues) return null;

      // Try all combinations up to 5
      // This is ~200 combinations which should be reasonable
      return findBestCueGroup(trimmedCues, target, 5);
    })
    // Ignore invalid groups
    .filter((a) => !!a)
    // Rank by the total penalty then by value length
    .sort((a, b) => {
      if (a.penalty < b.penalty) return -1;
      if (a.penalty > b.penalty) return 1;

      if (a.valueLength < b.valueLength) return -1;
      if (a.valueLength > b.valueLength) return 1;

      return 0;
    });

  return cueGroups.length ? cueGroups[0] : null;
};
