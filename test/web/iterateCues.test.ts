import { Cue, getCueTypesConfig } from '../../src/web/cues';
import { iterateCues } from '../../src/web/iterateCues';

const cueTypes: string[] = [
  'aria-label',
  'data-qa',
  'data-testid',
  'id',
  'text',
];

const buildCues = (level = 0): Cue[] => {
  const cueTypesConfig = getCueTypesConfig(['data-qa', 'data-testid']);
  return cueTypes.map((type) => {
    const { penalty } = cueTypesConfig[type];
    return {
      level,
      penalty,
      type,
      value: 'value'
    };
  });
};

describe('iterate cues', () => {
  it('orders attributes cues first then types with equal or higher rank', () => {
    const cues = [...buildCues(0), ...buildCues(1)];
    const iterated = Array.from(iterateCues(cues));
    expect(
      iterated.map((cues) => cues.map((c) => `${c.level}${c.type}`)),
    ).toMatchSnapshot();
  });
});
