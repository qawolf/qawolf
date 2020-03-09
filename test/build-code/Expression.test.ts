import { Expression } from '../../src/build-code/Expression';
import { Action, Step } from '../../src/types';
import { baseStep } from './fixtures';

describe('Expression', () => {
  test('throws error if invalid step action', () => {
    expect(
      () => new Expression({ ...baseStep, action: 'drag' as Action }),
    ).toThrowError();
  });

  describe('code()', () => {
    test('click step', () => {
      const expression = new Expression({
        ...baseStep,
        cssSelector: "[data-qa='test-input']",
      });

      expect(expression.code()).toBe(
        'await page.click("[data-qa=\'test-input\']");\n',
      );
    });

    test('fill step', () => {
      const fillStep: Step = {
        ...baseStep,
        action: 'fill',
        value: 'hello',
      };

      expect(new Expression(fillStep).code()).toEqual(
        'await page.fill(selectors[0], "hello");\n',
      );
    });

    test('press step', () => {
      const pressStep: Step = {
        ...baseStep,
        action: 'press',
        value: 'Enter',
      };

      expect(new Expression(pressStep).code()).toEqual(
        'await page.press(selectors[0], "Enter");\n',
      );
    });

    test('scroll step', () => {
      const expression = new Expression({
        ...baseStep,
        action: 'scroll' as Action,
        cssSelector: "[id='my-input']",
        value: {
          x: 100,
          y: 200,
        },
      });

      expect(expression.code()).toBe(
        'await qawolf.scroll(page, "[id=\'my-input\']", { x: 100, y: 200 });\n',
      );
    });

    test('select step', () => {
      const expression = new Expression({
        ...baseStep,
        action: 'select' as Action,
        value: 'spirit',
      });

      expect(expression.code()).toBe(
        'await page.select(selectors[0], "spirit");\n',
      );
    });

    describe('type step', () => {
      test('with a value', () => {
        const expression = new Expression({
          ...baseStep,
          action: 'type' as Action,
          value: 'spirit',
        });

        expect(expression.code()).toBe(
          'await page.type(selectors[0], "spirit");\n',
        );
      });

      test('without a value', () => {
        expect(
          new Expression({
            ...baseStep,
            action: 'type',
            value: null,
          }).code(),
        ).toEqual('await page.type(selectors[0], null);\n');
      });
    });

    // TODO page logic will change
    // test.todo('consecutive steps on different pages', () => {
    //   expect(
    //     new Expression(
    //       {
    //         ...baseStep,
    //         index: 1,
    //         page: 1,
    //       },
    //       new Expression(baseStep),
    //     ).code(),
    //   ).toEqual('await page.click(selectors[1], { page: 1 });\n');
    // });
  });
});
