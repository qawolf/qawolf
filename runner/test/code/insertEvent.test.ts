import {
  buildEventCode,
  insertEvent
} from "../../src/code/insertEvent";
import { PATCH_HANDLE } from "../../src/code/patchUtils";
import { ElementEvent } from "../../src/types";

// use strings to represent the event source
// so we do not need to construct a page for the test
/* eslint-disable @typescript-eslint/no-explicit-any */

const time = Date.now();

const clickEvent: ElementEvent = {
  action: "click",
  selector: ".input",
  page: "p1" as any,
  time,
};

describe("buildEventCode", () => {
  it("builds an action with a selector", () => {
    expect(buildEventCode(clickEvent, "page")).toEqual(
      `await page.click(".input");`
    );
  });

  it("builds an action with a value", () => {
    expect(
      buildEventCode({ ...clickEvent, action: "fill", value: "hello" }, "page")
    ).toEqual(`await page.fill(".input", "hello");`);
  });

  it("builds a goto action", () => {
    expect(
      buildEventCode(
        { action: "goto", page: 0 as any, time, value: "https://google.com" },
        "page"
      )
    ).toEqual(`await page.goto("https://google.com");`);
  });

  it("builds a reload action", () => {
    expect(
      buildEventCode({ action: "reload", page: 0 as any, time }, "page")
    ).toEqual(`await page.reload();`);
  });

  it("skips the selector for keyboard.press", () => {
    expect(
      buildEventCode(
        { ...clickEvent, action: "keyboard.press", value: "Escape" },
        "page"
      )
    ).toEqual(`await page.keyboard.press("Escape");`);
  });
});

describe("insertEvent", () => {
  it("patches the initialization and method", () => {
    expect(
      insertEvent({
        code: PATCH_HANDLE,
        expressions: [],
        event: {
          action: "goto",
          page: { bringToFront: 1, name: "p2" } as any,
          time,
          value: "https://google.com",
        },
        variables: { page: "p1" },
      })
    ).toEqual([
      {
        index: 0,
        type: "insert",
        value: `const page2 = await context.newPage();\nawait page2.goto("https://google.com");\n`,
      },
    ]);
  });
});
