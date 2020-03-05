import { buildVirtualCode } from '../../src/build-code/buildVirtualCode';
import { VirtualCode } from '../../src/build-code/VirtualCode';
import { baseStep } from './fixtures';

const virtualCode = buildVirtualCode([baseStep]);

describe('VirtualCode', () => {
  // TODO
  // test.todo('codeToUpdate returns the last expression when it changed', () => {
  //   expect(virtualCode.codeToUpdate(virtualCode)).toBeNull();

  //   const virtualCodeTwo = buildVirtualCode([{ ...baseStep, page: 1 }]);

  //   // TODO page logic is off
  //   expect(virtualCode.codeToUpdate(virtualCodeTwo)).toEqual({
  //     original: 'await page.click(selectors[0]));',
  //     updated: 'await page.click(selectors[0]), { page: 1 });',
  //   });
  // });

  test('newExpressions returns the new expressions', () => {
    expect(virtualCode.newExpressions(virtualCode)).toHaveLength(0);

    const newExpressions = new VirtualCode([]).newExpressions(virtualCode);
    expect(newExpressions).toEqual(virtualCode.expressions());
  });
});
