import { parseActionExpressions } from "../../src/code/parseCode";
import { PATCH_HANDLE } from "../../src/code/patch";
import { patchPopup } from "../../src/code/patchPopup";

/* eslint-disable @typescript-eslint/no-explicit-any */

const expected = `await something();
const [page2] = await Promise.all([
  page.waitForEvent("popup"),
  page.press('.todo', 'Enter'),
]);
await page2.waitForLoadState("domcontentloaded");
await page2.bringToFront();
${PATCH_HANDLE}`;

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
    ).toEqual(expected);
  });
});
