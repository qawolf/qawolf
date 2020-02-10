import { CONFIG } from "@qawolf/config";
import { Action } from "@qawolf/types";
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
      CONFIG.attribute = "data-qa";

      const expression = new StepExpression(baseStep);

      expect(expression.code()).toBe(
        "await browser.click({ css: \"[data-qa='test-input']\" });"
      );
    });

    test("scroll step", () => {
      CONFIG.attribute = "id";

      const expression = new StepExpression({
        ...baseStep,
        action: "scroll" as Action,
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
      CONFIG.attribute = "";

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
      CONFIG.attribute = "";

      const expression = new StepExpression({
        ...baseStep,
        action: "type" as Action,
        value: "spirit"
      });

      expect(expression.code()).toBe(
        'await browser.type(selectors[0], "spirit");'
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
