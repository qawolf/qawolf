import { buildVirtualCode, VirtualCode } from "../src";
import { baseStep } from "./fixtures";

const virtualCode = buildVirtualCode([baseStep]);

describe("VirtualCode", () => {
  test("codeToUpdate returns the last expression when it changed", () => {
    expect(virtualCode.codeToUpdate(virtualCode)).toBeNull();

    const virtualCodeTwo = buildVirtualCode([{ ...baseStep, page: 1 }]);
    expect(virtualCode.codeToUpdate(virtualCodeTwo)).toEqual({
      original: "await browser.click({ css: \"[data-qa='test-input']\" });",
      updated:
        "await browser.click({ css: \"[data-qa='test-input']\" }, { page: 1 });"
    });
  });

  test("newExpressions returns the new expressions", () => {
    expect(virtualCode.newExpressions(virtualCode)).toHaveLength(0);

    const newExpressions = new VirtualCode([]).newExpressions(virtualCode);
    expect(newExpressions).toEqual(virtualCode.expressions());
  });
});
