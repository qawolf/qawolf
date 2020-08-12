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

const sortCues = (cues: Cue[]) => {
  return [...cues].sort((a, b) => {
    // first sort by level
    if (a.level < b.level) return 1;
    if (a.level > b.level) return -1;

    // then sort by penalty
    if (a.penalty < b.penalty) return 1;
    if (a.penalty > b.penalty) return -1;

    // prefer shorter values for the same penalty
    if (a.value.length < b.value.length) return 1;
    if (a.value.length > b.value.length) return -1;

    return 0;
  });
};

var combine = function (a, min) {
  var fn = function (n, src, got, all) {
    if (n == 0) {
      if (got.length > 0) {
        all[all.length] = got;
      }
      return;
    }
    for (var j = 0; j < src.length; j++) {
      fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
    }
    return;
  };

  var all = [];

  fn(min, a, [], all);

  // TODO?
  // all.push(a);
  return all;
};

// Remove cues as long as the selector still matches the target
export const minimizeCues = (
  cues: Cue[],
  target: HTMLElement,
): RankedCues | null => {
  // Order by penalty descending
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
  // TODO
  const cueToKeep = findNearestPreferredAttributeCue(cues);

  let minCues = sortCues(cues);

  // Slim down the cues by removing any unnecessary cues
  // until we can try all combinations in a reasonable time
  for (let i = 0; i < minCues.length && minCues.length > 8; i++) {
    // keep attribute cues
    if (minCues[i].penalty === 0) continue;

    const cuesWithoutI = [...minCues];
    cuesWithoutI.splice(i, 1);

    const partsWithoutCue = buildSelectorParts(cuesWithoutI);

    if (isMatch({ selectorParts: partsWithoutCue, target })) {
      minCues = cuesWithoutI;
      minSelectorParts = partsWithoutCue;
      i -= 1;
    }
  }

  let minPenalty = minCues.reduce((a, b) => a + b.penalty, 0);

  const cuesOptions = minCues;

  // We hopefully slimmed down the sample size to 8 above
  // If we try all combinations of sample size 1..5 we only need to try 218 combos
  // Which is reasonable computationally
  for (let i = 1; i < 5; i++) {
    const cueCombinations = combine(cuesOptions, i);

    // check each combination for this level
    for (let j = 0; j < cueCombinations.length; j++) {
      const cuesToTest: Cue[] = cueCombinations[j];
      const penalty = cuesToTest.reduce((a, b) => a + b.penalty, 0);

      if (penalty > minPenalty) continue;

      // TODO consider other things here like length amongst cues
      if (penalty === minPenalty && cuesToTest.length > minCues.length)
        continue;

      if (cueToKeep && !cuesToTest.includes(cueToKeep)) {
        cuesToTest.push(cueToKeep);
      }

      const trySelectorParts = buildSelectorParts(cuesToTest);

      if (isMatch({ selectorParts: trySelectorParts, target })) {
        minCues = cuesToTest;
        minPenalty = penalty;
        minSelectorParts = trySelectorParts;
      }
    }
  }

  return {
    cues: minCues,
    penalty: minPenalty,
    selectorParts: buildSelectorParts(minCues),
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
