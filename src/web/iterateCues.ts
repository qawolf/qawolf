import { Cue, CueType } from './cues';

const CueTypesRanked: CueType[] = [
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

function* iterateGroups(targetCues: Cue[], ancestorCue?: Cue) {
  if (ancestorCue) {
    yield* targetCues.map((targetCue) => [ancestorCue, targetCue]);
  } else {
    yield* targetCues.map((cue) => [cue]);
  }
}

function* iterateType(targetCues: Cue[], ancestorCues: Cue[], type: CueType) {
  // try attribute cues first
  yield* iterateGroups(targetCues.filter((cue) => cue.type === type));

  for (const ancestorCue of ancestorCues.filter((cue) => cue.type === type)) {
    yield* iterateGroups(targetCues, ancestorCue);
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

  yield* iterateType(targetCues, ancestorCues, 'attribute');

  // try target cues alone
  yield* iterateGroups(targetCues.filter((cue) => cue.type !== 'attribute'));

  // try remaining ancestor cues
  for (const type of CueTypesRanked.slice(1)) {
    yield* iterateType(targetCues, ancestorCues, type);
  }
}
