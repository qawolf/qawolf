import { buildVirtualCode } from '../../src/build-code/buildVirtualCode';
import { VirtualCode } from '../../src/build-code/VirtualCode';
import { baseStep } from './fixtures';

const virtualCode = buildVirtualCode([baseStep]);

describe('VirtualCode', () => {
  test('buildPatch returns the last expression when it changed', () => {
    expect(virtualCode.buildPatch(virtualCode)).toBeNull();

    const virtualCodeTwo = buildVirtualCode([
      { ...baseStep, action: 'type', value: 'world' },
    ]);

    expect(virtualCode.buildPatch(virtualCodeTwo)).toEqual({
      original: 'await page.click(selectors["0_my_input_input"]);',
      updated: 'await page.type(selectors["0_my_input_input"], "world");',
    });
  });

  test('newExpressions returns the new expressions', () => {
    expect(virtualCode.newLines(virtualCode)).toHaveLength(0);

    const newExpressions = new VirtualCode([]).newLines(virtualCode);
    expect(newExpressions).toEqual(virtualCode.lines());
  });
});
