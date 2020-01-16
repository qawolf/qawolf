import { CONFIG } from "@qawolf/config";
import { Action } from "@qawolf/types";
import { htmlToDoc } from "@qawolf/web";
import { stepToSelector } from "../src/stepToSelector";

const doc = htmlToDoc;

describe("stepToSelector", () => {
  it("returns CssSelector if attribute is id and findValue specified", () => {
    CONFIG.attribute = "id";

    const step = {
      action: "click" as Action,
      html: {
        ancestors: [],
        node: doc("<input id='my-input' data-qa='test-input' />")
      },
      index: 0,
      page: 0
    };

    const selector = stepToSelector(step);

    expect(selector).toEqual({
      css: "[id='my-input']"
    });
  });

  it("returns CssSelector if attribute is data-qa and findValue specified", () => {
    CONFIG.attribute = "data-other, data-qa";

    const step = {
      action: "click" as Action,
      html: {
        ancestors: [],
        node: doc("<input id='my-input' data-qa='test-input' />")
      },
      index: 0,
      page: 0
    };

    const selector = stepToSelector(step);

    expect(selector).toEqual({
      css: "[data-qa='test-input']"
    });
  });

  it("returns HtmlSelector if attribute is not specified", () => {
    CONFIG.attribute = "";

    const step = {
      action: "click" as Action,
      html: {
        ancestors: [],
        node: doc("<input id='my-input' data-qa='test-input' />")
      },
      index: 0,
      page: 0
    };

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

    const step = {
      action: "click" as Action,
      html: {
        ancestors: [],
        node: doc("<input id='my-input' data-qa='test-input' />")
      },
      index: 0,
      page: 0
    };

    const selector = stepToSelector(step);

    expect(selector).toEqual({
      html: {
        ancestors: [],
        node: '<input id="my-input" data-qa="test-input"/>'
      }
    });
  });
});
