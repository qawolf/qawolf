import { parseActionExpressions } from "../../src/code/parseCode";
import { PATCH_HANDLE } from "../../src/code/patch";
import {
  findFillExpression,
  patchFill,
  PatchFillOptions,
  updateFill,
} from "../../src/code/patchFill";

/* eslint-disable @typescript-eslint/no-explicit-any */

const options: PatchFillOptions = {
  code: "",
  expressions: [],
  event: {
    action: "fill",
    page: "p1" as any,
    selector: "input",
    value: "hello",
  },
  variables: { page: "p1" },
};

describe("findFillExpression", () => {
  it("returns null if there is no matching fill within the past two statements", () => {
    expect(findFillExpression(options)).toEqual(null);
  });

  it("returns the last expression if it matches the variable and selector", () => {
    const expressions = parseActionExpressions(
      `await page.fill('input', '');\n${PATCH_HANDLE}`
    );

    expect(
      findFillExpression({
        ...options,
        expressions,
      })
    ).toEqual({
      args: [
        { end: 23, text: "input" },
        { end: 27, text: "" },
      ],
      method: "fill",
      statement: expect.any(Object),
      variable: "page",
    });
  });

  it("returns the second to last (matching) expression when followed by a press on the same variable", () => {
    expect(
      findFillExpression({
        ...options,
        expressions: parseActionExpressions(
          `await page.fill('input', 'world');await page.press('input', 'Enter');${PATCH_HANDLE}`
        ),
      })
    ).toEqual({
      args: [
        { end: 23, text: "input" },
        { end: 32, text: "world" },
      ],
      method: "fill",
      statement: expect.any(Object),
      variable: "page",
    });

    expect(
      findFillExpression({
        ...options,
        expressions: parseActionExpressions(
          `await page.fill('input', 'world');await page2.press('input', 'Enter');${PATCH_HANDLE}`
        ),
      })
    ).toEqual(null);
  });
});

describe("updateFill", () => {
  it("matches the argument indentation", () => {
    const code = `await page.fill('.hello',  ''  );${PATCH_HANDLE}`;
    const [expression] = parseActionExpressions(code);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(updateFill(code, expression!, "world")).toEqual(
      `await page.fill('.hello',  "world"  );${PATCH_HANDLE}`
    );
  });

  it("updates the value", () => {
    const code = `await page.fill('.hello', 'there');${PATCH_HANDLE}`;
    const [expression] = parseActionExpressions(code);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(updateFill(code, expression!, "world")).toEqual(
      `await page.fill('.hello', "world");${PATCH_HANDLE}`
    );
  });
});

describe("patchFill", () => {
  it("inserts a fill", () => {
    expect(patchFill({ ...options, code: PATCH_HANDLE })).toEqual(
      `await page.fill("input", "hello");\n${PATCH_HANDLE}`
    );
  });

  it("updates a matching fill", () => {
    const code = `  await page.fill("input", "hi")\n${PATCH_HANDLE}`;

    expect(
      patchFill({
        ...options,
        code,
        expressions: parseActionExpressions(code),
      })
    ).toEqual(`  await page.fill("input", "hello")\n${PATCH_HANDLE}`);
  });
});
