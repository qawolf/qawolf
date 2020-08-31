import {
  buildStepLines,
  escapeSelector,
} from '../../src/build-code/buildStepLines';
import { Action } from '../../src/types';
import { baseStep } from './fixtures';

describe('escapeSelector', () => {
  it('uses double quotes by default', () => {
    expect(escapeSelector('a')).toBe(`"a"`);
  });

  it('uses single quotes when there are double quotes in the selector', () => {
    expect(escapeSelector('"a"')).toBe(`'"a"'`);
  });

  it('uses backtick when there are double and single quotes', () => {
    expect(escapeSelector(`text="a" and 'b'`)).toBe('`text="a" and \'b\'`');

    // escapes backtick
    expect(escapeSelector('text="a" and \'b\' and `c`')).toBe(
      '`text="a" and \'b\' and \\`c\\``',
    );
  });
});

describe('buildStepLines', () => {
  test('step on new page, after step on a different page', () => {
    const lines = buildStepLines({
      ...baseStep,
      event: {
        ...baseStep.event,
        page: 1,
      },
      index: 1,
    });

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "const page2 = await qawolf.waitForPage(page.context(), 1);",
        "await page2.click('[data-qa=\\"test-input\\"]');",
      ]
    `);
  });

  test('step on existing page, after step on a different page', () => {
    const lines = buildStepLines(
      {
        ...baseStep,
        event: {
          ...baseStep.event,
          page: 1,
        },
        index: 1,
      },
      {
        initializedFrames: new Map<string, string>(),
        initializedPages: new Set([0, 1]),
        visiblePage: 0,
      },
    );

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "await page2.bringToFront();",
        "await page2.click('[data-qa=\\"test-input\\"]');",
      ]
    `);
  });

  test('iframe step', () => {
    const lines = buildStepLines({
      ...baseStep,
      event: {
        ...baseStep.event,
        frameIndex: 0,
        frameSelector: '#frameId',
      },
      index: 1,
    });

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "const frame = await (await page.waitForSelector(\\"#frameId\\")).contentFrame();",
        "await frame.click('[data-qa=\\"test-input\\"]');",
      ]
    `);
  });

  test('iframe step with an existing frame', () => {
    const initializedFrames = new Map<string, string>();
    initializedFrames.set('0#frameId', 'frame');

    const lines = buildStepLines(
      {
        ...baseStep,
        event: {
          ...baseStep.event,
          frameIndex: 0,
          frameSelector: '#frameId',
        },
        index: 1,
      },
      {
        initializedFrames,
        initializedPages: new Set([0]),
        visiblePage: 0,
      },
    );

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "await frame.click('[data-qa=\\"test-input\\"]');",
      ]
    `);
  });

  test('iframe step with a new frame', () => {
    const initializedFrames = new Map<string, string>();
    initializedFrames.set('0#frameId', 'frame');

    const lines = buildStepLines(
      {
        ...baseStep,
        event: {
          ...baseStep.event,
          frameIndex: 1,
          frameSelector: '#frameId',
        },
        index: 1,
      },
      {
        initializedFrames,
        initializedPages: new Set([0]),
        visiblePage: 0,
      },
    );

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "const frame2 = await (await page.waitForSelector(\\"#frameId\\")).contentFrame();",
        "await frame2.click('[data-qa=\\"test-input\\"]');",
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
