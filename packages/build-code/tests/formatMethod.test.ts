import { CONFIG } from "@qawolf/config";
import { Action } from "@qawolf/types";
import { htmlToDoc } from "@qawolf/web";
import {
  formatMethod,
  formatOptions,
  formatSelector
} from "../src/formatMethod";

const doc = htmlToDoc;

const step = {
  action: "click" as Action,
  html: {
    ancestors: [],
    node: doc("<input id='my-input' data-qa='test-input' />")
  },
  index: 0,
  page: 0
};

describe("formatMethod", () => {
  it("formats click step", () => {
    CONFIG.attribute = "data-qa";

    const formattedMethod = formatMethod(step);

    expect(formattedMethod).toBe(
      "context.click({ css: \"[data-qa='test-input']\" })"
    );
  });

  it("formats scroll step", () => {
    CONFIG.attribute = "id";

    const formattedMethod = formatMethod({
      ...step,
      action: "scroll" as Action,
      value: {
        x: 100,
        y: 200
      }
    });

    expect(formattedMethod).toBe(
      "context.scroll({ css: \"[id='my-input']\" }, { x: 100, y: 200 })"
    );
  });

  it("formats select step", () => {
    CONFIG.attribute = "";

    const formattedMethod = formatMethod({
      ...step,
      action: "select" as Action,
      value: "spirit"
    });

    expect(formattedMethod).toBe('context.select(selectors[0], "spirit")');
  });

  it("formats type step", () => {
    CONFIG.attribute = "";

    const formattedMethod = formatMethod(
      {
        ...step,
        action: "type" as Action,
        page: 1,
        value: "spirit"
      },
      step
    );

    expect(formattedMethod).toBe(
      'context.type(selectors[0], "spirit", { page: 1 })'
    );
  });

  it("throws error if invalid step action", () => {
    expect(() => {
      formatMethod({ ...step, action: "drag" as Action });
    }).toThrowError();
  });
});

describe("formatOptions", () => {
  it("returns empty string if no previous step", () => {
    const formattedOptions = formatOptions(step);

    expect(formattedOptions).toBe("");
  });

  it("returns empty string if step and previous step on same page", () => {
    const formattedOptions = formatOptions(step, { ...step, index: 1 });

    expect(formattedOptions).toBe("");
  });

  it("returns options if step and previous step on different pages", () => {
    const formattedOptions = formatOptions(step, {
      ...step,
      index: 1,
      page: 1
    });

    expect(formattedOptions).toBe(", { page: 0 }");
  });
});

describe("formatSelector", () => {
  it("formats CssSelector", () => {
    CONFIG.attribute = "id";

    const formattedSelector = formatSelector(step);

    expect(formattedSelector).toBe("{ css: \"[id='my-input']\" }");
  });

  it("formats HtmlSelector", () => {
    CONFIG.attribute = "";

    const formattedSelector = formatSelector({ ...step, index: 11 });

    expect(formattedSelector).toBe("selectors[11]");
  });
});
