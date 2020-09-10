import { loadFixtures } from '../loadFixtures';
import { buildVirtualCode } from '../../src/build-code/buildVirtualCode';
import { buildSteps } from '../../src/build-workflow/buildSteps';
import { CodeReconciler } from '../../src/create-code/CodeReconciler';
import { PATCH_HANDLE } from '../../src/create-code/patchCode';
import { Step } from '../../src/types';

describe('CodeReconciler.reconcile', () => {
  let steps: Step[];

  beforeAll(async () => {
    const events = (await loadFixtures('login')).events;
    steps = buildSteps(events);
  });

  it('ignores new expressions when patch handle is missing', () => {
    const reconciler = new CodeReconciler();

    const newCode = buildVirtualCode([steps[0]]);
    expect(reconciler.hasChanges(newCode)).toBeTruthy();

    const reconciled = reconciler.reconcile({
      actualCode: 'original code',
      virtualCode: newCode,
    });
    expect(reconciled).toEqual('original code');
  });

  it('inserts new expressions', () => {
    const reconciler = new CodeReconciler();

    const newCode = buildVirtualCode([steps[0]]);
    expect(reconciler.hasChanges(newCode)).toBeTruthy();

    const reconciled = reconciler.reconcile({
      actualCode: PATCH_HANDLE,
      virtualCode: newCode,
    });
    expect(reconciled).toMatchSnapshot();
  });

  it('updates the last expression', () => {
    const reconciler = new CodeReconciler();

    const originalCode = buildVirtualCode([steps[0]]);
    reconciler.update(originalCode);

    const newCode = buildVirtualCode([steps[1]]);
    expect(reconciler.hasChanges(newCode)).toBeTruthy();

    const reconciled = reconciler.reconcile({
      actualCode: originalCode.code(),
      virtualCode: newCode,
    });
    expect(reconciled).toMatchSnapshot();
  });

  it('updates the last expression after a step was removed (ex: paste)', () => {
    const reconciler = new CodeReconciler();

    const originalCode = buildVirtualCode([steps[0]]);
    reconciler.update(originalCode);

    const removedStepCode = buildVirtualCode([]);

    // we don't want it to do anything until a new step arrives
    expect(reconciler.hasChanges(removedStepCode)).toBeFalsy();
    let reconciled = reconciler.reconcile({
      actualCode: originalCode.code(),
      virtualCode: removedStepCode,
    });
    expect(reconciled).toEqual(originalCode.code());

    const stepAddedCode = buildVirtualCode([steps[1]]);
    expect(reconciler.hasChanges(stepAddedCode)).toBeTruthy();

    reconciled = reconciler.reconcile({
      actualCode: originalCode.code(),
      virtualCode: stepAddedCode,
    });
    expect(reconciled).toMatchSnapshot();
  });
});
