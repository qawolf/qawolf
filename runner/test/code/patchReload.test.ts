import { parseActionExpressions } from "../../src/code/parseCode";
import { PATCH_HANDLE } from "../../src/code/patch";
import { PatchEventOptions } from "../../src/code/patchEvent";
import { patchReload } from "../../src/code/patchReload";

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

  const reloadCode = `await page.reload({ waitUntil: "domcontentloaded" });\n${PATCH_HANDLE}`;
  const expressions = parseActionExpressions(reloadCode);

  it("does not insert a reload after a previous one", () => {
    expect(
      patchReload({
        ...options,
        code: reloadCode,
        expressions,
      })
    ).toEqual(null);
  });

  it("inserts a reload", () => {
    expect(
      patchReload({
        ...options,
        code: PATCH_HANDLE,
      })
    ).toEqual(reloadCode);
  });
});
