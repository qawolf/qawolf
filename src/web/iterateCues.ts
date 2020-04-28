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

  // iterate the ancestor cues of equal or higher rank
  // with the target cues of the type
  const eligibleTypes = CueTypesRanked.slice(
    // skip attribute since it already iterated
    1,
    CueTypesRanked.indexOf(type) + 1,
  );
  for (const ancestorCue of include(ancestorCues, ...eligibleTypes)) {
    yield* iterateGroups(typeTargetCues, ancestorCue);
  }
}

export function* iterateCues(cues: Cue[]): Generator<Cue[], void, undefined> {
  // order by closeness to target
  const ancestorCues = cues
    .filter((cue) => cue.level !== 0)
    .sort((a, b) => a.level - b.level);

  // order by rank
  const targetCues = cues
    .filter((cue) => cue.level === 0)
    .sort(
      (a, b) => CueTypesRanked.indexOf(a.type) - CueTypesRanked.indexOf(b.type),
    );

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
