import { Cue } from './cues';

const CueTypeRank = [
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

export class CuePermutations {
  _cues: Cue[];
  _targetCues: Cue[];

  constructor(cues: Cue[]) {
    // sorted by level
    this._cues = [...cues];
    cues.sort((a, b) => a.level - b.level);

    this._targetCues = cues.filter((cue) => cue.level === 0);

    // sort by rank
    this._targetCues.sort(
      (a, b) => CueTypeRank.indexOf(a.type) - CueTypeRank.indexOf(b.type),
    );
  }

  *_iterateType(type: string): Generator<Cue[]> {
    const cuesForType = this._cues.filter((cue) => cue.type === type);

    for (const cue of cuesForType) {
      // try the target cue alone
      if (cue.level === 0) yield [cue];

      // try the cue with the other target cues
      for (const targetCue of this._targetCues) {
        // do not combine a cue with itself
        if (targetCue === cue) continue;

        yield [cue, targetCue];
      }
    }
  }

  *iterate(): Generator<Cue[]> {
    // try attribute cues first
    for (const cueGroup of this._iterateType(CueTypeRank[0])) yield cueGroup;

    // try each target cue on its own
    for (const targetCue of this._targetCues) yield [targetCue];

    // try each type of cue in order of rank
    for (const type of CueTypeRank.slice(1)) {
      for (const cueGroup of this._iterateType(type)) yield cueGroup;
    }
  }
}

export const combineCues = (cues: Cue[]): Generator<Cue[]> => {
  const permutations = new CuePermutations(cues);
  return permutations.iterate();
};
