import { Action } from "@qawolf/types";
import { htmlToDoc } from "@qawolf/web";
import { stepToSelector, buildSelector } from "../src/buildSelector";

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

describe("stepToSelector", () => {
  it("returns CSS selector if specified", () => {
    const selector = stepToSelector({
      ...step,
      cssSelector: "[data-qa='submit']"
    });

    expect(selector).toEqual({ css: "[data-qa='submit']" });
  });

  it("returns HtmlSelector if CSS selector not present", () => {
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
    const builtSelector = buildSelector({
      ...step,
      cssSelector: "[id='my-input']"
    });

    expect(builtSelector).toBe("{ css: \"[id='my-input']\" }");
  });

  it("builds HtmlSelector", () => {
    const builtSelector = buildSelector({ ...step, index: 11 });

    expect(builtSelector).toBe("selectors[11]");
  });
});
