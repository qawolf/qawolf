import {
  canPatch,
  patchCode,
  PATCH_SYMBOL,
  removePatchSymbol
} from "../../src/code";

describe("canPatch", () => {
  it("returns true when the create symbol is found", () => {
    expect(canPatch(`someCode();\n${PATCH_SYMBOL}`)).toBe(true);
  });

  it("returns false when the create symbol is missing", () => {
    expect(canPatch("")).toBe(false);
  });
});

describe("patchCode", () => {
  it("matches indentation", () => {
    const patched = patchCode({
      code: `  myMethod();\n  ${PATCH_SYMBOL}`,
      patch: "myPatch();"
    });
    expect(patched).toEqual("  myMethod();\n  myPatch();");
  });
});

describe("removePatchSymbol", () => {
  it("removes the line with the patch symbol", () => {
    const patched = removePatchSymbol(
      `myMethod();\n${PATCH_SYMBOL}\nmySecondMethod();`
    );
    expect(patched).toEqual("myMethod();\nmySecondMethod();");
  });
});
