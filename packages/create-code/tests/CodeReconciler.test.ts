import { buildVirtualCode } from "@qawolf/build-code";
import { buildSteps } from "@qawolf/build-workflow";
import { loadEvents } from "@qawolf/test";
import { Step } from "@qawolf/types";
import { CodeReconciler } from "../src/CodeReconciler";
import { PATCH_HANDLE } from "../src/patchCode";

describe("CodeReconciler.reconcile", () => {
  let steps: Step[];

  beforeAll(async () => {
    const events = await loadEvents("scroll_login");
    steps = buildSteps({ events });
  });

  it("inserts new expressions", () => {
    const reconciler = new CodeReconciler();

    const newCode = buildVirtualCode([steps[0]], true);
    expect(reconciler.hasChanges(newCode)).toBeTruthy();

    const reconciled = reconciler.reconcile({
      actualCode: PATCH_HANDLE,
      virtualCode: newCode
    });
    expect(reconciled).toMatchSnapshot();
  });

  it("updates the last expression", () => {
    const reconciler = new CodeReconciler();

    const originalCode = buildVirtualCode([steps[0]], true);
    reconciler.update(originalCode);

    const newCode = buildVirtualCode([steps[1]], true);
    expect(reconciler.hasChanges(newCode)).toBeTruthy();

    const reconciled = reconciler.reconcile({
      actualCode: originalCode.code(),
      virtualCode: newCode
    });
    expect(reconciled).toMatchSnapshot();
  });

  it("updates the last expression after a step was removed (ex: paste)", () => {
    const reconciler = new CodeReconciler();

    const originalCode = buildVirtualCode([steps[0]], true);
    reconciler.update(originalCode);

    const removedStepCode = buildVirtualCode([], true);

    // we dont want it to do anything until a new step arrives
    expect(reconciler.hasChanges(removedStepCode)).toBeFalsy();
    let reconciled = reconciler.reconcile({
      actualCode: originalCode.code(),
      virtualCode: removedStepCode
    });
    expect(reconciled).toEqual(originalCode.code());

    const stepAddedCode = buildVirtualCode([steps[1]], true);
    expect(reconciler.hasChanges(stepAddedCode)).toBeTruthy();

    reconciled = reconciler.reconcile({
      actualCode: originalCode.code(),
      virtualCode: stepAddedCode
    });
    expect(reconciled).toMatchSnapshot();
  });
});
