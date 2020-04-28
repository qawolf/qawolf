import { Cue, CueType } from './cues';

export const CueTypesRanked: CueType[] = [
  'attribute',
  'id',
  'aria-label',
  'title',
  'name',
  'for',
  'text',
  'contenteditable',
  'value',
  'placeholder',
  'alt',
  'src',
  'href',
  'class',
  'tag',
];

const include = (cues: Cue[], ...include: CueType[]): Cue[] =>
  cues.filter((cue) => include.includes(cue.type));

const sortByRank = (cues: Cue[]): Cue[] =>
  cues.sort((a, b) => {
    const aType = CueTypesRanked.indexOf(a.type);
    const bType = CueTypesRanked.indexOf(b.type);

    // put the higher rank type at the top
    if (aType < bType) return -1;
    if (aType > bType) return 1;

    // put the lower level at the top
    if (a.level < b.level) return -1;
    if (a.level > b.level) return 1;

    return 0;
  });

function* iterateGroups(
  targetCues: Cue[],
  ancestorCue?: Cue,
): Generator<Cue[], void, undefined> {
  if (ancestorCue) {
    yield* targetCues.map((targetCue) => [ancestorCue, targetCue]);
  } else {
    yield* targetCues.map((cue) => [cue]);
  }
}

function* iterateType(
  targetCues: Cue[],
  ancestorCues: Cue[],
  type: CueType,
): Generator<Cue[], void, undefined> {
  // iterate the target cues of the type alone
  const typeTargetCues = include(targetCues, type);
  yield* iterateGroups(typeTargetCues);

  // iterate the cues of equal or higher rank
  const eligibleTypes = CueTypesRanked.slice(
    // skip attribute since it already iterated
    1,
    CueTypesRanked.indexOf(type) + 1,
  );

  for (const ancestorCue of include(ancestorCues, ...eligibleTypes)) {
    if (ancestorCue.type === type) {
      // iterate the ancestor of this type, with all higher ranked target cues
      yield* iterateGroups(include(targetCues, ...eligibleTypes), ancestorCue);
    } else {
      // iterate the ancestor of a higher ranked type, with all of this type target cues
      yield* iterateGroups(typeTargetCues, ancestorCue);
    }
  }
}

export function* iterateCues(cues: Cue[]): Generator<Cue[], void, undefined> {
  const ancestorCues = sortByRank(cues.filter((cue) => cue.level !== 0));
  const targetCues = sortByRank(cues.filter((cue) => cue.level === 0));

  // iterate attribute cues first
  yield* iterateGroups(include(targetCues, 'attribute'));
  for (const ancestorCue of include(ancestorCues, 'attribute')) {
    yield* iterateGroups(targetCues, ancestorCue);
  }

  // iterate remaining cue types
  for (const type of CueTypesRanked.slice(1)) {
    yield* iterateType(targetCues, ancestorCues, type);
  }
}
