import { buildLongestCueGroups } from '../../src/web/optimizeCues';

describe('buildLongestCueGroups', () => {
  it('only includes text or css cues per level', () => {
    const groups = buildLongestCueGroups([
      { level: 0, penalty: 12, type: 'text', value: 'Level 0' },
      { level: 0, penalty: 40, type: 'tag', value: 'a' },
      { level: 0, penalty: 40, type: 'tag', value: 'b' },
      { level: 1, penalty: 12, type: 'text', value: 'Level 1' },
      { level: 1, penalty: 40, type: 'tag', value: 'c' },
      { level: 1, penalty: 40, type: 'tag', value: 'd' },
    ]);

    expect(groups).toEqual([
      [
        { level: 1, penalty: 40, type: 'tag', value: 'c' },
        { level: 1, penalty: 40, type: 'tag', value: 'd' },
        { level: 0, penalty: 40, type: 'tag', value: 'a' },
        { level: 0, penalty: 40, type: 'tag', value: 'b' },
      ],
      [
        { level: 1, penalty: 40, type: 'tag', value: 'c' },
        { level: 1, penalty: 40, type: 'tag', value: 'd' },
        { level: 0, penalty: 12, type: 'text', value: 'Level 0' },
      ],
      [
        { level: 1, penalty: 12, type: 'text', value: 'Level 1' },
        { level: 0, penalty: 40, type: 'tag', value: 'a' },
        { level: 0, penalty: 40, type: 'tag', value: 'b' },
      ],
      [
        { level: 1, penalty: 12, type: 'text', value: 'Level 1' },
        { level: 0, penalty: 12, type: 'text', value: 'Level 0' },
      ],
    ]);
  });
});
