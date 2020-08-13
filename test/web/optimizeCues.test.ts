import { buildCueSets, combine } from '../../src/web/optimizeCues';

describe('buildCueSets', () => {
  const penalty = 1;
  const level0Text = { level: 0, penalty, type: 'text', value: 'Level 0' };
  const level0TagA = { level: 0, penalty, type: 'tag', value: 'a' };
  const level0TagB = { level: 0, penalty, type: 'tag', value: 'b' };
  const level1Text = { level: 1, penalty, type: 'text', value: 'Level 1' };
  const level1TagA = { level: 1, penalty, type: 'tag', value: 'a' };
  const level1TagB = { level: 1, penalty, type: 'tag', value: 'b' };

  it('only includes text or css cues per level', () => {
    const sets = buildCueSets([
      level0Text,
      level0TagA,
      level0TagB,
      level1Text,
      level1TagA,
      level1TagB,
    ]);

    expect(sets).toEqual([
      [level1TagA, level1TagB, level0TagA, level0TagB],
      [level1TagA, level1TagB, level0Text],
      [level1Text, level0TagA, level0TagB],
      [level1Text, level0Text],
    ]);
  });
});

describe('combine', () => {
  it('builds combinations for the specified size', () => {
    expect(combine([1, 2, 3, 4, 5], 2)).toEqual([
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [2, 3],
      [2, 4],
      [2, 5],
      [3, 4],
      [3, 5],
      [4, 5],
    ]);

    expect(combine([1, 2, 3, 4], 3)).toEqual([
      [1, 2, 3],
      [1, 2, 4],
      [1, 3, 4],
      [2, 3, 4],
    ]);
  });
});
