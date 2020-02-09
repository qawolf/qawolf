type Expression = {};

export class VirtualCode {
  private _expressions: Expression[] = [];

  public expressions() {
    return this._expressions;
  }
}

export class CodeReconciler {
  // the virtual code representation of the actual code
  private _virtualCode: VirtualCode = new VirtualCode();

  public hasUpdates(virtualCode: VirtualCode) {
    // const stepsToPatch = options.steps.slice(this._commitedStepIndex);
    // TODO....
    // if (!stepsToPatch.length && !options.removeHandle) {
    //   return;
    // }
    return false;
  }

  public reconcile(actualCode: string, virtualCode: VirtualCode): string {
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
