import { Cue, findNearestPreferredAttributeCue } from './cues';
import { buildSelectorParts, isMatch } from './selectorParts';
import { SelectorPart } from './types';

type CueTypes = {
  css: Cue[];
  text: Cue[];
};

type RankedCues = {
  cues: Cue[];
  penalty: number;
  selectorParts: SelectorPart[];
};

/**
 * Build all permutations of the longest cue group.
 * There are multiple permutations, since each level can have either css or text cues.
 */
export const buildLongestCueGroups = (cues: Cue[]) => {
  const cuesByLevel = new Map<number, CueTypes>();

  // group cues by level and type
  cues.forEach((cue) => {
    const cueTypes = cuesByLevel.has(cue.level)
      ? cuesByLevel.get(cue.level)
      : { css: [], text: [] };

    if (cue.type === 'text') {
      cueTypes.text.push(cue);
    } else {
      cueTypes.css.push(cue);
    }

    cuesByLevel.set(cue.level, cueTypes);
  });

  let cueGroups: Cue[][] = [];

  // levels descending
  const levels = [...cuesByLevel.keys()].sort((a, b) => b - a);

  // go through each level and append it to each cue group
  // cue groups can only have one type per level
  // so we create a new group per type
  levels.forEach((level) => {
    const cueLevel = cuesByLevel.get(level);

    const cueGroupsWithLevel: Cue[][] = [];

    cueGroups.forEach((cueGroup) => {
      if (cueLevel.css.length) {
        cueGroupsWithLevel.push([...cueGroup, ...cueLevel.css]);
      }

      if (cueLevel.text.length) {
        cueGroupsWithLevel.push([...cueGroup, ...cueLevel.text]);
      }
    });

    // if this is the first level create a group per type
    if (!cueGroups.length) {
      if (cueLevel.css.length) {
        cueGroupsWithLevel.push([...cueLevel.css]);
      }

      if (cueLevel.text.length) {
        cueGroupsWithLevel.push([...cueLevel.text]);
      }
    }

    cueGroups = cueGroupsWithLevel;
  });

  return cueGroups;
};

// Remove cues as long as the selector still matches the target
export const minimizeCues = (
  cues: Cue[],
  target: HTMLElement,
): RankedCues | null => {
  // Order by penalty descending
  let minCues = [...cues].sort((a, b) => {
    // first sort by penalty
    if (a.penalty < b.penalty) return 1;
    if (a.penalty > b.penalty) return -1;

    // prefer shorter values for the same penalty
    if (a.value.length < b.value.length) return 1;
    if (a.value.length > b.value.length) return -1;

    return 0;
  });

  let minSelectorParts = buildSelectorParts(cues);

  if (!isMatch({ selectorParts: minSelectorParts, target })) {
    // this should never happen
    console.debug(
      'qawolf: element did not match all selector parts',
      minSelectorParts,
      target,
    );
    return null;
  }

  // Keep the nearest attribute
  const cueToKeep = findNearestPreferredAttributeCue(cues);

  for (let i = 0; i < minCues.length; i++) {
    if (minCues[i] === cueToKeep) continue;

    const cuesWithoutI = [...minCues];
    cuesWithoutI.splice(i, 1);

    const partsWithoutCue = buildSelectorParts(cuesWithoutI);

    if (isMatch({ selectorParts: partsWithoutCue, target })) {
      minCues = cuesWithoutI;
      minSelectorParts = partsWithoutCue;
      i -= 1;
    }

    continue;
  }

  const penalty = minCues.reduce((a, b) => a + b.penalty, 0);

  return {
    cues: minCues,
    penalty,
    selectorParts: minSelectorParts,
  };
};

export const optimizeCues = (
  cues: Cue[],
  target: HTMLElement,
): SelectorPart[] | null => {
  const cueGroups = buildLongestCueGroups(cues);

  // minimize all the cue groups
  // pick the lowest penalty one
  const rankedSelectorParts = cueGroups
    .map((cueGroup) => minimizeCues(cueGroup, target))
    .filter((a) => !!a)
    // order by penalty ascending
    .sort((a, b) => a.penalty - b.penalty);

  return rankedSelectorParts.length
    ? rankedSelectorParts[0].selectorParts
    : null;
};
