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
        'await page.scroll("[id=\'my-input\']", { x: 100, y: 200 });\n',
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

    test('type step with a value', () => {
      const expression = new Expression({
        ...baseStep,
        action: 'type' as Action,
        value: 'spirit',
      });

      expect(expression.code()).toBe(
        'await page.type(selectors[0], "spirit");\n',
      );
    });

    test('type step replacing a value', () => {
      const replaceStep: Step = {
        ...baseStep,
        action: 'type',
        replace: true,
        value: 'hello',
      };

      expect(new Expression(replaceStep).code()).toEqual(
        'await page.type(selectors[0], "hello", { replace: true });\n',
      );

      expect(
        new Expression({
          ...replaceStep,
          page: 1,
        }).code(),
      ).toEqual(
        'await page.type(selectors[0], "hello", { page: 1, replace: true });\n',
      );
    });

    test('type step without a value', () => {
      expect(
        new Expression({
          ...baseStep,
          action: 'type',
          value: null,
        }).code(),
      ).toEqual('await page.type(selectors[0], null);\n');
    });

    test('consecutive steps on the same page', () => {
      expect(
        new Expression({
          ...baseStep,
          index: 1,
        }).code(),
      ).toEqual('await page.click(selectors[1]);\n');
    });

    //   // TODO page logic will change
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
