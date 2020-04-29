import { Cue } from '../../src/web/cues';
import { CueTypesRanked, iterateCues } from '../../src/web/iterateCues';

const buildCues = (level = 0): Cue[] =>
  CueTypesRanked.slice(0, 4).map((type) => ({ level, type, value: 'value' }));

describe('iterate cues', () => {
  it('orders attributes cues first then types with equal or higher rank', () => {
    const cues = [...buildCues(0), ...buildCues(1), ...buildCues(2)];
    const iterated = Array.from(iterateCues(cues));
    expect(
      iterated.map((cues) => cues.map((c) => `${c.level}${c.type}`)),
    ).toEqual([
      ['0attribute'],
      ['1attribute', '0attribute'],
      ['1attribute', '0text'],
      ['1attribute', '0id'],
      ['1attribute', '0aria-label'],
      ['2attribute', '0attribute'],
      ['2attribute', '0text'],
      ['2attribute', '0id'],
      ['2attribute', '0aria-label'],
      ['0text'],
      ['1text', '0text'],
      ['2text', '0text'],
      ['0id'],
      ['1text', '0id'],
      ['2text', '0id'],
      ['1id', '0text'],
      ['1id', '0id'],
      ['2id', '0text'],
      ['2id', '0id'],
      ['0aria-label'],
      ['1text', '0aria-label'],
      ['2text', '0aria-label'],
      ['1id', '0aria-label'],
      ['2id', '0aria-label'],
      ['1aria-label', '0text'],
      ['1aria-label', '0id'],
      ['1aria-label', '0aria-label'],
      ['2aria-label', '0text'],
      ['2aria-label', '0id'],
      ['2aria-label', '0aria-label'],
    ]);
  });
});
