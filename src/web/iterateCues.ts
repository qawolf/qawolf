import { Cue } from './cues';

const CueTypesRanked = [
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

// TODO fix split between href and other cue types

export function* iterateCues(cues: Cue[]): Generator<Cue[], void, undefined> {
  // ordered by closeness to target
  const ancestorCues = cues
    .filter((cue) => cue.level !== 0)
    .sort((a, b) => a.level - b.level);

  // ordered by rank
  const targetCues = cues
    .filter((cue) => cue.level === 0)
    .sort(
      (a, b) => CueTypesRanked.indexOf(a.type) - CueTypesRanked.indexOf(b.type),
    );

  // try target attribute cues first
  yield* targetCues
    .filter((cue) => cue.type === 'attribute')
    .map((cue) => [cue]);

  // try ancestor attribute cues
  for (const ancestorCue of ancestorCues.filter(
    (cue) => cue.type === 'attribute',
  )) {
    for (const targetCue of targetCues) yield [ancestorCue, targetCue];
  }

  // try targer cues alone
  yield* targetCues
    // skip attribute since we already tried it
    // skip href since we do not want to use that alone
    .filter((cue) => cue.type !== 'attribute' && cue.type !== 'href')
    .map((cue) => [cue]);

  // try remaining ancestor cues
  for (const type of CueTypesRanked.slice(1)) {
    // when we get to href, try the target cues alone since we skipped them earlier
    if (type === 'href') {
      yield* targetCues
        .filter((cue) => cue.type === 'href')
        .map((cue) => [cue]);
    }

    // try ancestor attribute cues
    for (const ancestorCue of ancestorCues.filter((cue) => cue.type === type)) {
      for (const targetCue of targetCues) yield [ancestorCue, targetCue];
    }
  }
}
