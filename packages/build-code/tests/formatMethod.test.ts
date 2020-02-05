import { CONFIG } from "@qawolf/config";
import { Action } from "@qawolf/types";
import { htmlToDoc } from "@qawolf/web";
import {
  formatMethod,
  formatOptions,
  formatSelector
} from "../src/formatMethod";

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

describe("formatMethod", () => {
  it("formats click step", () => {
    CONFIG.attribute = "data-qa";

    const formattedMethod = formatMethod(baseStep);

    expect(formattedMethod).toBe(
      "await browser.click({ css: \"[data-qa='test-input']\" });"
    );
  });

  it("formats scroll step", () => {
    CONFIG.attribute = "id";

    const formattedMethod = formatMethod({
      ...baseStep,
      action: "scroll" as Action,
      value: {
        x: 100,
        y: 200
      }
    });

    expect(formattedMethod).toBe(
      "await browser.scroll({ css: \"[id='my-input']\" }, { x: 100, y: 200 });"
    );
  });

  it("formats select step", () => {
    CONFIG.attribute = "";

    const formattedMethod = formatMethod({
      ...baseStep,
      action: "select" as Action,
      value: "spirit"
    });

    expect(formattedMethod).toBe(
      'await browser.select(selectors[0], "spirit");'
    );
  });

  it("formats type step", () => {
    CONFIG.attribute = "";

    const formattedMethod = formatMethod(
      {
        ...baseStep,
        action: "type" as Action,
        page: 1,
        value: "spirit"
      },
      baseStep
    );

    expect(formattedMethod).toBe(
      'await browser.type(selectors[0], "spirit", { page: 1 });'
    );
  });

  it("formats clear an input", () => {
    expect(
      formatMethod({
        ...baseStep,
        action: "type",
        value: null
      })
    ).toEqual("await browser.type(selectors[0], null);");
  });

  it("throws error if invalid step action", () => {
    expect(() => {
      formatMethod({ ...baseStep, action: "drag" as Action });
    }).toThrowError();
  });
});

describe("formatOptions", () => {
  it("returns empty string if no previous step", () => {
    const formattedOptions = formatOptions(baseStep);

    expect(formattedOptions).toBe("");
  });

  it("returns empty string if step and previous step on same page", () => {
    const formattedOptions = formatOptions(baseStep, { ...baseStep, index: 1 });

    expect(formattedOptions).toBe("");
  });

  it("returns options if step and previous step on different pages", () => {
    const formattedOptions = formatOptions(baseStep, {
      ...baseStep,
      index: 1,
      page: 1
    });

    expect(formattedOptions).toBe(", { page: 0 }");
  });
});

describe("formatSelector", () => {
  it("formats CssSelector", () => {
    CONFIG.attribute = "id";

    const formattedSelector = formatSelector(baseStep);

    expect(formattedSelector).toBe("{ css: \"[id='my-input']\" }");
  });

  it("formats HtmlSelector", () => {
    CONFIG.attribute = "";

    const formattedSelector = formatSelector({ ...baseStep, index: 11 });

    expect(formattedSelector).toBe("selectors[11]");
  });
});
