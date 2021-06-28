import { parseActionExpressions } from "../../src/code/parseCode";
import { PATCH_HANDLE } from "../../src/code/patchUtils";
import {
  findLastPageVariable,
  prepareSourceVariable,
  prepareSourceVariables,
} from "../../src/code/prepareSourceVariables";
import { ElementEvent } from "../../src/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const time = Date.now();

const clickEvent: ElementEvent = {
  action: "click",
  selector: ".input",
  page: "p1" as any,
  time,
};

describe("prepareSourceVariable", () => {
  const frame = {} as any;
  const page = { bringToFront: 1 } as any;

  it("declares a page", () => {
    const variables: any = {};
    expect(
      prepareSourceVariable({ declare: true, pageOrFrame: page, variables })
    ).toEqual("page");
    expect(variables.page).toEqual(page);
  });

  it("declares a frame", () => {
    const variables: any = {};
    expect(
      prepareSourceVariable({ declare: true, pageOrFrame: frame, variables })
    ).toEqual("frame");
    expect(variables.frame).toEqual(frame);
  });

  it("increments to find an unused variable", () => {
    const variables: any = { page: "" };
    expect(
      prepareSourceVariable({ declare: true, pageOrFrame: page, variables })
    ).toEqual("page2");
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

describe("prepareSourceVariables", () => {
  it("initializes the frame if it does not exist", () => {
    expect(
      prepareSourceVariables({
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
      prepareSourceVariables({
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
      prepareSourceVariables({
        declare: true,
        event: {
          page: { bringToFront: 1, name: "p3" } as any,
        },
        expressions: [],
        shouldDeclarePageVariable: true,
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
      prepareSourceVariables({
        declare: true,
        event: {
          page: "p1" as any,
        },
        expressions: [],
        shouldDeclarePageVariable: true,
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
      prepareSourceVariables({
        event: clickEvent,
        expressions,
        shouldBringPageToFront: true,
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
