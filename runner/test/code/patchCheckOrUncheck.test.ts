import { PatchEventOptions } from "../../src/code/insertEvent";
import { parseActionExpressions } from "../../src/code/parseCode";
import { patchCheckOrUncheck } from "../../src/code/patchCheckOrUncheck"
import { PATCH_HANDLE } from "../../src/code/patchUtils";

const options: PatchEventOptions = {
  code: "",
  expressions: [],
  event: {
    action: "check",
    page: "p1" as any,
    selector: "input",
    time: Date.now(),
  },
  variables: { page: "p1" },
};

describe("patchCheckOrUncheck", () => {
  it("when there is no previous click, inserts a check", () => {
    expect(patchCheckOrUncheck({ ...options, code: PATCH_HANDLE })).toEqual(
      [
        {
          index: 0,
          type: "insert",
          value: 'await page.check("input");\n',
        },
      ]
    );
  });

  it("when there is no previous click, inserts an uncheck", () => {
    expect(patchCheckOrUncheck({
      ...options,
      event: {
        action: "uncheck",
        page: "p1" as any,
        selector: "input",
        time: Date.now(),
      },
      code: PATCH_HANDLE
    })).toEqual(
      [
        {
          index: 0,
          type: "insert",
          value: 'await page.uncheck("input");\n',
        },
      ]
    );
  });

  it("when there is a previous click, replaces it with check", () => {
    const code = `  await page.click("svg")\n${PATCH_HANDLE}`;

    expect(patchCheckOrUncheck({
      ...options,
      event: {
        action: "check",
        page: "p1" as any,
        relatedClickSelector: "svg",
        selector: "input",
        time: Date.now(),
      },
      expressions: parseActionExpressions(code),
      code,
    })).toEqual(
      [
        {
          index: 2,
          length: 23,
          type: "delete"
        },
        {
          index: 2,
          type: "insert",
          value: 'await page.check("input");',
        },
      ]
    );
  });

  it("when there is a previous click, replaces it with uncheck", () => {
    const code = `  await page.click("svg")\n${PATCH_HANDLE}`;

    expect(patchCheckOrUncheck({
      ...options,
      event: {
        action: "uncheck",
        page: "p1" as any,
        relatedClickSelector: "svg",
        selector: "input",
        time: Date.now(),
      },
      expressions: parseActionExpressions(code),
      code,
    })).toEqual(
      [
        {
          index: 2,
          length: 23,
          type: "delete"
        },
        {
          index: 2,
          type: "insert",
          value: 'await page.uncheck("input");',
        },
      ]
    );
  });
});
