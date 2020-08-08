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
  let cues: Cue[];
  let mockCueGroups: Cue[][];
  beforeAll(() => {
    cues = [...buildCues(0), ...buildCues(1)];
    mockCueGroups = Array.from(iterateCues(cues));
  });

  it('orders attributes cues first then types with equal or higher rank', () => {
    expect(mockCueGroups.map((cues) => cues.map((c) => `${c.level}${c.type}`))).toMatchSnapshot();
  });

  it('does not include the same group twice', () => {
    // Ensure that it has logic to prevent [0att1, 0att2] AND [0att2, 0att1],
    // for example, which are flipped but would result in the same selector.
    const normalizedGroups = new Set();
    const duplicateGroup = mockCueGroups.find((group) => {
      const normalizedGroup = group.map((c) => `${c.level}${c.type}`).sort().join(',');
      if (normalizedGroups.has(normalizedGroup)) return true;
      normalizedGroups.add(normalizedGroup);
      return false;
    });

    expect(duplicateGroup).toBe(undefined);
  });

  it('is sorted by total group penalty, ascending, when penaltyRangeIncrement is 1', () => {
    const groups = Array.from(iterateCues(cues, { penaltyRangeIncrement: 1 }));
    let lastTotalPenalty = 0;
    for (const group of groups) {
      const totalPenalty = group.reduce((acc, cue) => acc + cue.penalty, 0);
      expect(totalPenalty).toBeGreaterThanOrEqual(lastTotalPenalty);
      lastTotalPenalty = totalPenalty;
    }
  });
});
