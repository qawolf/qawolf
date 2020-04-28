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
    ).toMatchInlineSnapshot([
      ['0attribute'],
      ['1attribute', '0attribute'],
      ['1attribute', '0id'],
      ['1attribute', '0aria-label'],
      ['1attribute', '0title'],
      ['2attribute', '0attribute'],
      ['2attribute', '0id'],
      ['2attribute', '0aria-label'],
      ['2attribute', '0title'],
      ['0id'],
      ['1id', '0id'],
      ['2id', '0id'],
      ['0aria-label'],
      ['1id', '0aria-label'],
      ['1aria-label', '0aria-label'],
      ['2id', '0aria-label'],
      ['2aria-label', '0aria-label'],
      ['0title'],
      ['1id', '0title'],
      ['1aria-label', '0title'],
      ['1title', '0title'],
      ['2id', '0title'],
      ['2aria-label', '0title'],
      ['2title', '0title'],
    ]);
  });
});
