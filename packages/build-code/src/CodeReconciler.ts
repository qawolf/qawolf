import { VirtualCode } from "./VirtualCode";

type ReconcileOptions = {
  actualCode: string;
  virtualCode: VirtualCode;
};

export class CodeReconciler {
  // the virtual code representation of the actual code
  private _virtualCode: VirtualCode;

  public hasUpdates(virtualCode: VirtualCode) {
    // const stepsToPatch = options.steps.slice(this._commitedStepIndex);
    // TODO....
    // if (!stepsToPatch.length && !options.removeHandle) {
    //   return;
    // }
    return false;
  }

  public reconcile({ actualCode, virtualCode }: ReconcileOptions): string {
    /**
     * Reconcile the actual code with the new virtual code.
     */
    let reconciledCode = actualCode;

    // update the last expression if it changed

    // patch new expressions

    return reconciledCode;
  }

  public update(virtualCode: VirtualCode) {
    this._virtualCode = virtualCode;
  }
}
