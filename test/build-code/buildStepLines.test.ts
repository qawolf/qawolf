import {
  buildStepLines,
  escapeSelector,
  StepLineBuildContext,
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
        "const page2 = await qawolf.waitForPage(context, 1, { waitUntil: \\"domcontentloaded\\" });",
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
        "const page = await qawolf.waitForPage(context, 0, { waitUntil: \\"domcontentloaded\\" });",
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
        "const page = await qawolf.waitForPage(context, 0, { waitUntil: \\"domcontentloaded\\" });",
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
        "const page = await qawolf.waitForPage(context, 0, { waitUntil: \\"domcontentloaded\\" });",
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
        "const page = await qawolf.waitForPage(context, 0, { waitUntil: \\"domcontentloaded\\" });",
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
        "const page = await qawolf.waitForPage(context, 0, { waitUntil: \\"domcontentloaded\\" });",
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
        "const page = await qawolf.waitForPage(context, 0, { waitUntil: \\"domcontentloaded\\" });",
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
          "const page = await qawolf.waitForPage(context, 0, { waitUntil: \\"domcontentloaded\\" });",
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
          "const page = await qawolf.waitForPage(context, 0, { waitUntil: \\"domcontentloaded\\" });",
          "await page.type('[data-qa=\\"test-input\\"]', null);",
        ]
      `);
    });
  });

  test('goto step', () => {
    const buildContext: StepLineBuildContext = {
      initializedFrames: new Map<string, string>(),
      initializedPages: new Set([]),
      visiblePage: 0,
    };

    // Initial page
    let lines = buildStepLines(
      {
        action: 'goto' as Action,
        event: {
          name: 'goto',
          page: 0,
          time: Date.now(),
        },
        index: 0,
        value: 'http://localhost:5000',
      },
      buildContext,
    );

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "const page = await context.newPage();",
        "await page.goto(\\"http://localhost:5000\\", { waitUntil: \\"domcontentloaded\\" });",
      ]
    `);

    // Manual new tab
    lines = buildStepLines(
      {
        action: 'goto' as Action,
        event: {
          name: 'goto',
          page: 1,
          time: Date.now(),
        },
        index: 1,
        value: 'https://google.com',
      },
      buildContext,
    );

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "const page2 = await context.newPage();",
        "await page2.bringToFront();",
        "await page2.goto(\\"https://google.com\\", { waitUntil: \\"domcontentloaded\\" });",
      ]
    `);
  });

  test('back step', () => {
    const buildContext: StepLineBuildContext = {
      initializedFrames: new Map<string, string>(),
      initializedPages: new Set([]),
      visiblePage: 0,
    };

    const lines = buildStepLines(
      {
        action: 'goBack' as Action,
        event: {
          name: 'goBack',
          page: 0,
          time: Date.now(),
        },
        index: 0,
      },
      buildContext,
    );

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "const page = await qawolf.waitForPage(context, 0, { waitUntil: \\"domcontentloaded\\" });",
        "await page.goBack();",
      ]
    `);
  });

  test('reload step', () => {
    const buildContext: StepLineBuildContext = {
      initializedFrames: new Map<string, string>(),
      initializedPages: new Set([]),
      visiblePage: 0,
    };

    const lines = buildStepLines(
      {
        action: 'reload' as Action,
        event: {
          name: 'reload',
          page: 0,
          time: Date.now(),
        },
        index: 0,
      },
      buildContext,
    );

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "const page = await qawolf.waitForPage(context, 0, { waitUntil: \\"domcontentloaded\\" });",
        "await page.reload();",
      ]
    `);
  });
});
