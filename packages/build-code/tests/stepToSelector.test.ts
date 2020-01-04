import { CONFIG } from "@qawolf/config";
import { Action } from "@qawolf/types";
import { stepToSelector } from "../src/stepToSelector";

describe("stepToSelector", () => {
  it("returns CssSelector if findAttribute is id and findValue specified", () => {
    CONFIG.findAttribute = "id";

    const step = {
      action: "click" as Action,
      html: {
        ancestors: [],
        node: {
          attrs: {
            id: "my-input",
            "data-qa": "test-input"
          },
          children: [],
          name: "input",
          type: "tag",
          voidElement: false
        }
      },
      index: 0,
      page: 0
    };

    const selector = stepToSelector(step);

    expect(selector).toEqual({
      css: "[id='my-input']",
      page: 0
    });
  });

  it("returns CssSelector if findAttribute is data-qa and findValue specified", () => {
    CONFIG.findAttribute = "data-qa";

    const step = {
      action: "click" as Action,
      html: {
        ancestors: [],
        node: {
          attrs: {
            id: "my-input",
            "data-qa": "test-input"
          },
          children: [],
          name: "input",
          type: "tag",
          voidElement: false
        }
      },
      index: 0,
      page: 0
    };

    const selector = stepToSelector(step);

    expect(selector).toEqual({
      css: "[data-qa='test-input']",
      page: 0
    });
  });

  it("returns HtmlSelector if findAttribute is not specified", () => {
    CONFIG.findAttribute = null;

    const step = {
      action: "click" as Action,
      html: {
        ancestors: [],
        node: {
          attrs: {
            id: "my-input",
            "data-qa": "test-input"
          },
          children: [],
          name: "input",
          type: "tag",
          voidElement: false
        }
      },
      index: 0,
      page: 0
    };

    const selector = stepToSelector(step);

    expect(selector).toEqual({
      html: {
        ancestors: [],
        node: '<input id="my-input" data-qa="test-input"></input>'
      },
      page: 0
    });
  });

  it("returns HtmlSelector if findAttribute not present", () => {
    CONFIG.findAttribute = "aria-label";

    const step = {
      action: "click" as Action,
      html: {
        ancestors: [],
        node: {
          attrs: {
            id: "my-input",
            "data-qa": "test-input"
          },
          children: [],
          name: "input",
          type: "tag",
          voidElement: false
        }
      },
      index: 0,
      page: 0
    };

    const selector = stepToSelector(step);

    expect(selector).toEqual({
      html: {
        ancestors: [],
        node: '<input id="my-input" data-qa="test-input"></input>'
      },
      page: 0
    });
  });
});
