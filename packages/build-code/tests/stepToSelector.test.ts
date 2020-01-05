import { CONFIG } from "@qawolf/config";
import { Action } from "@qawolf/types";
import { htmlToDoc } from "@qawolf/web";
import { stepToSelector } from "../src/stepToSelector";

const doc = htmlToDoc;

describe("stepToSelector", () => {
  it("returns CssSelector if findAttribute is id and findValue specified", () => {
    CONFIG.findAttribute = "id";

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

  it("returns CssSelector if findAttribute is data-qa and findValue specified", () => {
    CONFIG.findAttribute = "data-qa";

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

  it("returns HtmlSelector if findAttribute is not specified", () => {
    CONFIG.findAttribute = null;

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

  it("returns HtmlSelector if findAttribute not present", () => {
    CONFIG.findAttribute = "aria-label";

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
