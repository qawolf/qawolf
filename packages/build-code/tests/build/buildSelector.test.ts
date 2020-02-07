import { CONFIG } from "@qawolf/config";
import { Action } from "@qawolf/types";
import { htmlToDoc } from "@qawolf/web";
import { stepToSelector, buildSelector } from "../../src/build";

const doc = htmlToDoc;

const step = {
  action: "click" as Action,
  canChange: false,
  html: {
    ancestors: [],
    node: doc("<input id='my-input' data-qa='test-input' />")
  },
  index: 0,
  page: 0
};

describe("stepToSelector", () => {
  it("returns CssSelector if a single attribute is specified (ignoring whitespace)", () => {
    CONFIG.attribute = " id ";

    const selector = stepToSelector(step);

    expect(selector).toEqual({
      css: "[id='my-input']"
    });
  });

  it("returns CssSelector if multiple attributes are specified", () => {
    CONFIG.attribute = "data-other, data-qa";
    const selector = stepToSelector(step);
    expect(selector).toEqual({
      css: "[data-qa='test-input']"
    });
  });

  it("returns HtmlSelector if attribute is not specified", () => {
    CONFIG.attribute = "";

    const selector = stepToSelector(step);
    expect(selector).toEqual({
      html: {
        ancestors: [],
        node: '<input id="my-input" data-qa="test-input"/>'
      }
    });
  });

  it("returns HtmlSelector if attribute not present", () => {
    CONFIG.attribute = "aria-label";

    const selector = stepToSelector(step);
    expect(selector).toEqual({
      html: {
        ancestors: [],
        node: '<input id="my-input" data-qa="test-input"/>'
      }
    });
  });
});

describe("buildSelector", () => {
  it("builds CssSelector", () => {
    CONFIG.attribute = "id";

    const builtSelector = buildSelector(step);

    expect(builtSelector).toBe("{ css: \"[id='my-input']\" }");
  });

  it("builds HtmlSelector", () => {
    CONFIG.attribute = "";

    const builtSelector = buildSelector({ ...step, index: 11 });

    expect(builtSelector).toBe("selectors[11]");
  });
});
