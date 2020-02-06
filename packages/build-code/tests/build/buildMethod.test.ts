import { CONFIG } from "@qawolf/config";
import { Action } from "@qawolf/types";
import { htmlToDoc } from "@qawolf/web";
import { buildMethod, buildMethodOptions } from "../../src/build";

const doc = htmlToDoc;

const baseStep = {
  action: "click" as Action,
  html: {
    ancestors: [],
    node: doc("<input id='my-input' data-qa='test-input' />")
  },
  index: 0,
  isFinal: true,
  page: 0
};

describe("buildMethod", () => {
  it("builds click step", () => {
    CONFIG.attribute = "data-qa";

    const built = buildMethod(baseStep);
    expect(built).toBe(
      "await browser.click({ css: \"[data-qa='test-input']\" });"
    );
  });

  it("builds scroll step", () => {
    CONFIG.attribute = "id";

    const built = buildMethod({
      ...baseStep,
      action: "scroll" as Action,
      value: {
        x: 100,
        y: 200
      }
    });

    expect(built).toBe(
      "await browser.scroll({ css: \"[id='my-input']\" }, { x: 100, y: 200 });"
    );
  });

  it("builds select step", () => {
    CONFIG.attribute = "";

    const built = buildMethod({
      ...baseStep,
      action: "select" as Action,
      value: "spirit"
    });

    expect(built).toBe('await browser.select(selectors[0], "spirit");');
  });

  it("builds type step", () => {
    CONFIG.attribute = "";

    const built = buildMethod(
      {
        ...baseStep,
        action: "type" as Action,
        page: 1,
        value: "spirit"
      },
      baseStep
    );

    expect(built).toBe(
      'await browser.type(selectors[0], "spirit", { page: 1 });'
    );
  });

  it("builds clear an input", () => {
    expect(
      buildMethod({
        ...baseStep,
        action: "type",
        value: null
      })
    ).toEqual("await browser.type(selectors[0], null);");
  });

  it("throws error if invalid step action", () => {
    expect(() => {
      buildMethod({ ...baseStep, action: "drag" as Action });
    }).toThrowError();
  });
});

describe("buildMethodOptions", () => {
  it("returns empty string if no previous step", () => {
    const builtOptions = buildMethodOptions(baseStep);

    expect(builtOptions).toBe("");
  });

  it("returns empty string if step and previous step on same page", () => {
    const builtOptions = buildMethodOptions(baseStep, {
      ...baseStep,
      index: 1
    });

    expect(builtOptions).toBe("");
  });

  it("returns options if step and previous step on different pages", () => {
    const builtOptions = buildMethodOptions(baseStep, {
      ...baseStep,
      index: 1,
      page: 1
    });

    expect(builtOptions).toBe(", { page: 0 }");
  });
});
