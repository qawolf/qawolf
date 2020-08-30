import { buildVirtualCode } from '../../src/build-code/buildVirtualCode';
import { baseStep } from './fixtures';

const virtualCode = buildVirtualCode([baseStep]);

describe('VirtualCode', () => {
  test('buildPatch returns null when nothing changed', () => {
    expect(virtualCode.buildPatch(virtualCode)).toBeNull();
  });

  test('buildPatch returns correct diff when there are new lines', () => {
    const virtualCodeTwo = buildVirtualCode([
      baseStep,
      { ...baseStep, action: 'type', value: 'world' },
    ]);

    expect(virtualCode.buildPatch(virtualCodeTwo)).toEqual({
      newLines: ['await page.type(\'[data-qa="test-input"]\', "world");'],
      removedLines: [],
    });
  });

  test('buildPatch returns correct diff when the last line has changed', () => {
    const virtualCodeTwo = buildVirtualCode([
      { ...baseStep, action: 'type', value: 'world' },
    ]);

    expect(virtualCode.buildPatch(virtualCodeTwo)).toEqual({
      newLines: ['await page.type(\'[data-qa="test-input"]\', "world");'],
      removedLines: ['await page.click(\'[data-qa="test-input"]\');'],
    });
  });

  test('buildPatch returns correct diff when the last 2 lines have changed', () => {
    const virtualCodeWithTwoLines = buildVirtualCode([
      { ...baseStep, action: 'click' },
      { ...baseStep, action: 'click' },
    ]);

    const virtualCodeTwo = buildVirtualCode([
      { ...baseStep, action: 'dblclick' },
    ]);

    expect(virtualCodeWithTwoLines.buildPatch(virtualCodeTwo)).toEqual({
      newLines: [
        'await page.dblclick(\'[data-qa="test-input"]\');',
      ],
      removedLines: [
        'await page.click(\'[data-qa="test-input"]\');',
        'await page.click(\'[data-qa="test-input"]\');',
      ],
    });
  });
});
