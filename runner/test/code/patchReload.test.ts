import { PatchEventOptions } from "../../src/code/insertEvent";
import { parseActionExpressions } from "../../src/code/parseCode";
import { patchReload } from "../../src/code/patchReload";
import { PATCH_HANDLE } from "../../src/code/patchUtils";

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("reload", () => {
  const options: PatchEventOptions = {
    code: "",
    expressions: [],
    event: {
      action: "reload",
      page: "p1" as any,
      time: Date.now(),
    },
    variables: { page: "p1" },
  };

  const reloadCode = `await page.reload();\n${PATCH_HANDLE}`;
  const expressions = parseActionExpressions(reloadCode);

  it("does not insert a reload after a previous one", () => {
    expect(
      patchReload({
        ...options,
        code: reloadCode,
        expressions,
      })
    ).toEqual([]);
  });

  it("inserts a reload", () => {
    expect(
      patchReload({
        ...options,
        code: PATCH_HANDLE,
      })
    ).toEqual([{ index: 0, type: "insert", value: `await page.reload();\n` }]);
  });
});
