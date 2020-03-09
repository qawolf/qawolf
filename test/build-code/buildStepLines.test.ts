import { buildStepLines } from '../../src/build-code/buildStepLines';
import { Action } from '../../src/types';
import { baseStep } from './fixtures';

describe('buildStepLines', () => {
  test('consecutive steps on different pages', () => {
    const lines = buildStepLines(
      {
        ...baseStep,
        index: 1,
        page: 1,
      },
      baseStep,
    );

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "page = await qawolf.waitForPage(page.context(), 1);",
        "await page.click(selectors[1]);",
      ]
    `);
  });

  test('click step', () => {
    const lines = buildStepLines({
      ...baseStep,
      cssSelector: "[data-qa='test-input']",
    });

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "await page.click(\\"[data-qa='test-input']\\");",
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
        "await page.fill(selectors[0], \\"hello\\");",
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
        "await page.press(selectors[0], \\"Enter\\");",
      ]
    `);
  });

  test('scroll step', () => {
    const lines = buildStepLines({
      ...baseStep,
      action: 'scroll' as Action,
      cssSelector: "[id='my-input']",
      value: {
        x: 100,
        y: 200,
      },
    });

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "await qawolf.scroll(page, \\"[id='my-input']\\", { x: 100, y: 200 });",
      ]
    `);
  });

  test('select step', () => {
    const lines = buildStepLines({
      ...baseStep,
      action: 'select' as Action,
      value: 'spirit',
    });

    expect(lines).toMatchInlineSnapshot(`
      Array [
        "await page.select(selectors[0], \\"spirit\\");",
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
  "await page.type(selectors[0], \\"spirit\\");",
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
  "await page.type(selectors[0], null);",
]
`);
    });
  });
});
