import { PatchEventOptions } from "../../src/code/insertEvent";
import { parseActionExpressions } from "../../src/code/parseCode";
import {
  findExpressionToUpdate,
  patchFillOrSelectOption,
  updateExpression,
} from "../../src/code/patchFillOrSelectOption";
import { PATCH_HANDLE } from "../../src/code/patchUtils";

/* eslint-disable @typescript-eslint/no-explicit-any */

const options: PatchEventOptions = {
  code: "",
  expressions: [],
  event: {
    action: "fill",
    page: "p1" as any,
    selector: "input",
    time: Date.now(),
    value: "hello",
  },
  variables: { page: "p1" },
};

const selectOptions = { ...options };
selectOptions.event = {
  ...options.event,
  action: "selectOption",
  selector: "select",
};

describe("findExpressionToUpdate", () => {
  it("returns null if there is no matching action within the past two statements", () => {
    expect(findExpressionToUpdate(options)).toEqual(null);
  });

  it("returns the last expression if it matches the variable and selector", () => {
    const expressions = parseActionExpressions(
      `await page.fill('input', '');\n${PATCH_HANDLE}`
    );

    expect(
      findExpressionToUpdate({
        ...options,
        expressions,
      })
    ).toEqual({
      args: [
        { end: 23, pos: 16, text: "input" },
        { end: 27, pos: 24, text: "" },
      ],
      method: "fill",
      statement: expect.any(Object),
      variable: "page",
    });
  });

  it("returns the second to last (matching) expression when followed by a press on the same variable", () => {
    expect(
      findExpressionToUpdate({
        ...options,
        expressions: parseActionExpressions(
          `await page.fill('input', 'world');await page.press('input', 'Enter');${PATCH_HANDLE}`
        ),
      })
    ).toEqual({
      args: [
        { end: 23, pos: 16, text: "input" },
        { end: 32, pos: 24, text: "world" },
      ],
      method: "fill",
      statement: expect.any(Object),
      variable: "page",
    });

    expect(
      findExpressionToUpdate({
        ...options,
        expressions: parseActionExpressions(
          `await page.fill('input', 'world');await page2.press('input', 'Enter');${PATCH_HANDLE}`
        ),
      })
    ).toEqual(null);
  });
});

describe("patchFillOrSelectOption", () => {
  it("inserts a fill", () => {
    expect(patchFillOrSelectOption({ ...options, code: PATCH_HANDLE })).toEqual(
      [
        {
          index: 0,
          type: "insert",
          value: 'await page.fill("input", "hello");\n',
        },
      ]
    );
  });

  it("inserts a selectOption", () => {
    expect(
      patchFillOrSelectOption({ ...selectOptions, code: PATCH_HANDLE })
    ).toEqual([
      {
        index: 0,
        type: "insert",
        value: 'await page.selectOption("select", "hello");\n',
      },
    ]);
  });

  it("updates a matching fill", () => {
    const code = `  await page.fill("input", "hi")\n${PATCH_HANDLE}`;

    expect(
      patchFillOrSelectOption({
        ...options,
        code,
        expressions: parseActionExpressions(code),
      })
    ).toEqual([
      { index: 26, length: 5, type: "delete" },
      { index: 26, type: "insert", value: ' "hello"' },
    ]);
  });

  it("updates a matching selectOption", () => {
    const code = `  await page.selectOption("select", "hi")\n${PATCH_HANDLE}`;

    expect(
      patchFillOrSelectOption({
        ...selectOptions,
        code,
        expressions: parseActionExpressions(code),
      })
    ).toEqual([
      { index: 35, length: 5, type: "delete" },
      { index: 35, type: "insert", value: ' "hello"' },
    ]);
  });
});

describe("updateExpression", () => {
  it("matches the argument indentation", () => {
    const code = `await page.fill('.hello',  ''  );${PATCH_HANDLE}`;
    const [expression] = parseActionExpressions(code);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(updateExpression(code, expression!, "world")).toEqual([
      { index: 25, length: 4, type: "delete" },
      { index: 25, type: "insert", value: '  "world"' },
    ]);
  });

  it("updates the value", () => {
    const code = `await page.fill('.hello', 'there');${PATCH_HANDLE}`;
    const [expression] = parseActionExpressions(code);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(updateExpression(code, expression!, "world")).toEqual([
      { index: 25, length: 8, type: "delete" },
      { index: 25, type: "insert", value: ' "world"' },
    ]);
  });
});
