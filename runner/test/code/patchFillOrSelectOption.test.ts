import { parseActionExpressions } from "../../src/code/parseCode";
import { PATCH_HANDLE } from "../../src/code/patch";
import { PatchEventOptions } from "../../src/code/patchEvent";
import {
  findExpressionToUpdate,
  patchFillOrSelectOption,
  updateExpression,
} from "../../src/code/patchFillOrSelectOption";

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
      findExpressionToUpdate({
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
      `await page.fill("input", "hello");\n${PATCH_HANDLE}`
    );
  });

  it("inserts a selectOption", () => {
    expect(
      patchFillOrSelectOption({ ...selectOptions, code: PATCH_HANDLE })
    ).toEqual(`await page.selectOption("select", "hello");\n${PATCH_HANDLE}`);
  });

  it("updates a matching fill", () => {
    const code = `  await page.fill("input", "hi")\n${PATCH_HANDLE}`;

    expect(
      patchFillOrSelectOption({
        ...options,
        code,
        expressions: parseActionExpressions(code),
      })
    ).toEqual(`  await page.fill("input", "hello")\n${PATCH_HANDLE}`);
  });

  it("updates a matching selectOption", () => {
    const code = `  await page.selectOption("select", "hi")\n${PATCH_HANDLE}`;

    expect(
      patchFillOrSelectOption({
        ...selectOptions,
        code,
        expressions: parseActionExpressions(code),
      })
    ).toEqual(`  await page.selectOption("select", "hello")\n${PATCH_HANDLE}`);
  });
});

describe("updateExpression", () => {
  it("matches the argument indentation", () => {
    const code = `await page.fill('.hello',  ''  );${PATCH_HANDLE}`;
    const [expression] = parseActionExpressions(code);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(updateExpression(code, expression!, "world")).toEqual(
      `await page.fill('.hello',  "world"  );${PATCH_HANDLE}`
    );
  });

  it("updates the value", () => {
    const code = `await page.fill('.hello', 'there');${PATCH_HANDLE}`;
    const [expression] = parseActionExpressions(code);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(updateExpression(code, expression!, "world")).toEqual(
      `await page.fill('.hello', "world");${PATCH_HANDLE}`
    );
  });
});
