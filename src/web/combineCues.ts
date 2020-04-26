import { Cue, CueTypeRank } from './cues';

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

  *_iterateType(type: string) {
    const cuesForType = this._cues.filter((cue) => cue.type === type);

    for (let cue of cuesForType) {
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

  *iterate() {
    // try attribute cues first
    for (let cueGroup of this._iterateType(CueTypeRank[0])) yield cueGroup;

    // try each target cue on its own
    for (let targetCue of this._targetCues) yield [targetCue];

    // try each type of cue in order of rank
    for (let type of CueTypeRank.slice(1)) {
      for (let cueGroup of this._iterateType(type)) yield cueGroup;
    }
  }
}

export const combineCues = (cues: Cue[]) => {
  const permutations = new CuePermutations(cues);
  return permutations.iterate();
};
