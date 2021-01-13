import { parseActionExpressions } from "../../src/code/parseCode";
import { PATCH_HANDLE } from "../../src/code/patch";
import {
  buildEventCode,
  declareSourceVariable,
  findLastPageVariable,
  findSourceVariables,
  formatSelector,
  patchEvent,
} from "../../src/code/patchEvent";
import { ElementEvent } from "../../src/types";

// use strings to represent the event source
// so we do not need to construct a page for the test
/* eslint-disable @typescript-eslint/no-explicit-any */

const clickEvent: ElementEvent = {
  action: "click",
  selector: ".input",
  page: "p1" as any,
};

describe("formatSelector", () => {
  it("uses double quotes by default", () => {
    expect(formatSelector("a")).toBe(`"a"`);
  });

  it("uses single quotes when there are double quotes in the selector", () => {
    expect(formatSelector('"a"')).toBe(`'"a"'`);
  });

  it("uses backtick when there are double and single quotes", () => {
    expect(formatSelector(`text="a" and 'b'`)).toBe("`text=\"a\" and 'b'`");

    // escapes backtick
    expect(formatSelector("text=\"a\" and 'b' and `c`")).toBe(
      "`text=\"a\" and 'b' and \\`c\\``"
    );
  });
});

describe("buildEventCode", () => {
  it("builds the selector", () => {
    expect(buildEventCode(clickEvent, "page")).toEqual(
      `await page.click(".input");`
    );
  });

  it("builds the value", () => {
    expect(
      buildEventCode({ ...clickEvent, action: "fill", value: "hello" }, "page")
    ).toEqual(`await page.fill(".input", "hello");`);
  });

  it("builds waitUntil option for goto and reload", () => {
    expect(buildEventCode({ action: "goto", page: 0 as any }, "page")).toEqual(
      `await page.goto({ waitUntil: "domcontentloaded" });`
    );

    expect(
      buildEventCode({ action: "reload", page: 0 as any }, "page")
    ).toEqual(`await page.reload({ waitUntil: "domcontentloaded" });`);
  });
});

describe("declareSourceVariable", () => {
  const frame = {} as any;
  const page = { bringToFront: 1 } as any;

  it("declares a page", () => {
    const variables: any = {};
    expect(declareSourceVariable(page, variables)).toEqual("page");
    expect(variables.page).toEqual(page);
  });

  it("declares a frame", () => {
    const variables: any = {};
    expect(declareSourceVariable(frame, variables)).toEqual("frame");
    expect(variables.frame).toEqual(frame);
  });

  it("increments to find an unused variable", () => {
    const variables: any = { page: "" };
    expect(declareSourceVariable(page, variables)).toEqual("page2");
    expect(variables.page2).toEqual(page);
  });
});

describe("findLastPageVariable", () => {
  it("finds the variable of the last expression that is a page", () => {
    const expressions = parseActionExpressions(
      `await page2.click('.hello');${PATCH_HANDLE}`
    );

    expect(
      findLastPageVariable(expressions, {
        page2: {
          // emulate a page
          bringToFront: 1,
        },
      })
    ).toEqual("page2");
  });
});

describe("findSourceVariables", () => {
  it("initializes the frame if it does not exist", () => {
    expect(
      findSourceVariables({
        event: {
          ...clickEvent,
          frame: "f1" as any,
          frameSelector: "#frame",
        },
        expressions: [],
        variables: { page: "p1" },
      })
    ).toEqual({
      initializeCode: `const frame = await (await page.waitForSelector("#frame")).contentFrame();\n`,
      pageVariable: "page",
      frameVariable: "frame",
      variable: "frame",
    });
  });

  it("reuses the frame that exists", () => {
    expect(
      findSourceVariables({
        event: {
          ...clickEvent,
          frame: "f2" as any,
          frameSelector: "#frame",
        },
        expressions: [],
        variables: { frame2: "f2", page: "p1" },
      })
    ).toEqual({
      initializeCode: "",
      pageVariable: "page",
      frameVariable: "frame2",
      variable: "frame2",
    });
  });

  it("initializes a new page for a goto", () => {
    expect(
      findSourceVariables({
        event: {
          action: "goto",
          page: { bringToFront: 1, name: "p3" } as any,
          value: "https://google.com",
        },
        expressions: [],
        variables: { page: "p1", page2: "p2" },
      })
    ).toEqual({
      initializeCode: `const page3 = await context.newPage();\n`,
      pageVariable: "page3",
      variable: "page3",
    });
  });

  it("reuses the page that exists", () => {
    expect(
      findSourceVariables({
        event: {
          action: "goto",
          page: "p1" as any,
          value: "https://google.com",
        },
        expressions: [],
        variables: { page: "p1" },
      })
    ).toEqual({
      initializeCode: "",
      pageVariable: "page",
      variable: "page",
    });
  });

  it("brings the page to the front when it changes", () => {
    const expressions = parseActionExpressions(
      `await page2.click('.hello');${PATCH_HANDLE}`
    );

    expect(
      findSourceVariables({
        event: clickEvent,
        expressions,
        variables: {
          page: "p1",
          page2: {
            // emulate a page
            bringToFront: 1,
          },
        },
      })
    ).toEqual({
      frameVariable: undefined,
      initializeCode: `await page.bringToFront();\n`,
      pageVariable: "page",
      variable: "page",
    });
  });
});

describe("patchEvent", () => {
  it("patches the initialization and method", () => {
    expect(
      patchEvent({
        code: PATCH_HANDLE,
        expressions: [],
        event: {
          action: "goto",
          page: { bringToFront: 1, name: "p2" } as any,
          value: "https://google.com",
        },
        variables: { page: "p1" },
      })
    ).toEqual(
      `const page2 = await context.newPage();\nawait page2.goto("https://google.com", { waitUntil: "domcontentloaded" });\n${PATCH_HANDLE}`
    );
  });
});
