import { parseActionExpressions } from "../../src/code/parseCode";
import { patchPopup } from "../../src/code/patchPopup";
import { PATCH_HANDLE } from "../../src/code/patchUtils";

/* eslint-disable @typescript-eslint/no-explicit-any */

const expected = `const [page2] = await Promise.all([
  page.waitForEvent("popup"),
  page.press('.todo', 'Enter'),
]);
await page2.waitForLoadState("domcontentloaded");
await page2.bringToFront();`;

describe("popup", () => {
  it("uses the previous expression to await the popup", () => {
    const code = `await something();\nawait page.press('.todo', 'Enter');\n${PATCH_HANDLE}`;

    expect(
      patchPopup({
        code,
        event: {
          action: "popup",
          page: "p1" as any,
          popup: "p2" as any,
          time: Date.now(),
        },
        expressions: parseActionExpressions(code),
        variables: { page: "p1" },
      })
    ).toEqual([{ index: 19, type: "insert", value: expected }]);
  });
});
