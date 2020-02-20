import { Action, Step } from "@qawolf/types";
import { StepExpression } from "../src/StepExpression";
import { baseStep } from "./fixtures";

describe("StepExpression", () => {
  test("throws error if invalid step action", () => {
    expect(
      () => new StepExpression({ ...baseStep, action: "drag" as Action })
    ).toThrowError();
  });

  describe("code()", () => {
    test("click step", () => {
      const expression = new StepExpression({
        ...baseStep,
        cssSelector: "[data-qa='test-input']"
      });

      expect(expression.code()).toBe(
        "await browser.click({ css: \"[data-qa='test-input']\" });"
      );
    });

    test("scroll step", () => {
      const expression = new StepExpression({
        ...baseStep,
        action: "scroll" as Action,
        cssSelector: "[id='my-input']",
        value: {
          x: 100,
          y: 200
        }
      });

      expect(expression.code()).toBe(
        "await browser.scroll({ css: \"[id='my-input']\" }, { x: 100, y: 200 });"
      );
    });

    test("select step", () => {
      const expression = new StepExpression({
        ...baseStep,
        action: "select" as Action,
        value: "spirit"
      });

      expect(expression.code()).toBe(
        'await browser.select(selectors[0], "spirit");'
      );
    });

    test("type step with a value", () => {
      const expression = new StepExpression({
        ...baseStep,
        action: "type" as Action,
        value: "spirit"
      });

      expect(expression.code()).toBe(
        'await browser.type(selectors[0], "spirit");'
      );
    });

    test("type step replacing a value", () => {
      const replaceStep: Step = {
        ...baseStep,
        action: "type",
        replace: true,
        value: "hello"
      };

      expect(new StepExpression(replaceStep).code()).toEqual(
        'await browser.type(selectors[0], "hello", { replace: true });'
      );

      expect(
        new StepExpression({
          ...replaceStep,
          page: 1
        }).code()
      ).toEqual(
        'await browser.type(selectors[0], "hello", { page: 1, replace: true });'
      );
    });

    test("type step without a value", () => {
      expect(
        new StepExpression({
          ...baseStep,
          action: "type",
          value: null
        }).code()
      ).toEqual("await browser.type(selectors[0], null);");
    });

    test("consecutive steps on the same page", () => {
      expect(
        new StepExpression({
          ...baseStep,
          index: 1
        }).code()
      ).toEqual("await browser.click(selectors[1]);");
    });

    test("consecutive steps on different pages", () => {
      expect(
        new StepExpression(
          {
            ...baseStep,
            index: 1,
            page: 1
          },
          new StepExpression(baseStep)
        ).code()
      ).toEqual("await browser.click(selectors[1], { page: 1 });");
    });
  });
});
