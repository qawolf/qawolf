import {
  buildSelector,
  buildStepLines,
} from '../../src/build-code/buildStepLines';
import { Action } from '../../src/types';
import { baseStep } from './fixtures';

describe('buildSelector', () => {
  const expectEqual = (selector: string, expected: string) => {
    const built = buildSelector({
      ...baseStep,
      event: {
        ...baseStep.event,
        selector,
      },
    });
    expect(built).toEqual(expected);
  };

  it('uses double quotes by default', () => {
    expectEqual('a', `"a"`);
  });

  it('uses single quotes when there are double quotes in the selector', () => {
    expectEqual('"a"', `'"a"'`);
  });

  it('uses backtick when there are double and single quotes', () => {
    expectEqual(`text="a" and 'b'`, '`text="a" and \'b\'`');

    // escapes backtick
    expectEqual(
      'text="a" and \'b\' and `c`',
      '`text="a" and \'b\' and \\`c\\``',
    );
  });
});

describe('buildStepLines', () => {
  test('consecutive steps on different pages', () => {
    const lines = buildStepLines(
      {
        ...baseStep,
        event: {
          ...baseStep.event,
          page: 1,
        },
        index: 1,
      },
      baseStep,
    );

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "page = await qawolf.waitForPage(page.context(), 1);",
        "await page.click('[data-qa=\\"test-input\\"]');",
      ]
    `);
  });

  test('click step', () => {
    const lines = buildStepLines(baseStep);

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "await page.click('[data-qa=\\"test-input\\"]');",
      ]
    `);
  });

  test('fill step', () => {
    const lines = buildStepLines({
      ...baseStep,
      action: 'fill',
      value: 'hello',
    });

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "await page.fill('[data-qa=\\"test-input\\"]', \\"hello\\");",
      ]
    `);
  });

  test('press step', () => {
    const lines = buildStepLines({
      ...baseStep,
      action: 'press',
      value: 'Enter',
    });

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "await page.press('[data-qa=\\"test-input\\"]', \\"Enter\\");",
      ]
    `);
  });

  test('scroll step', () => {
    const lines = buildStepLines({
      ...baseStep,
      action: 'scroll' as Action,
      value: {
        x: 100,
        y: 200,
      },
    });

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "await qawolf.scroll(page, '[data-qa=\\"test-input\\"]', { x: 100, y: 200 });",
      ]
    `);
  });

  test('select step', () => {
    const lines = buildStepLines({
      ...baseStep,
      action: 'selectOption' as Action,
      value: 'spirit',
    });

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "await page.selectOption('[data-qa=\\"test-input\\"]', \\"spirit\\");",
      ]
    `);
  });

  describe('type step', () => {
    test('with a value', () => {
      const lines = buildStepLines({
        ...baseStep,
        action: 'type' as Action,
        value: 'spirit',
      });

      expect(lines).toMatchInlineSnapshot(`
        Array [
          "await page.type('[data-qa=\\"test-input\\"]', \\"spirit\\");",
        ]
      `);
    });

    test('without a value', () => {
      const lines = buildStepLines({
        ...baseStep,
        action: 'type',
        value: null,
      });

      expect(lines).toMatchInlineSnapshot(`
        Array [
          "await page.type('[data-qa=\\"test-input\\"]', null);",
        ]
      `);
    });
  });
});
