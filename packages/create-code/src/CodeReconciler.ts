import { VirtualCode } from "@qawolf/build-code";
import { last } from "lodash";
import { patchCode, PATCH_HANDLE } from "./patchCode";

type ReconcileOptions = {
  actualCode: string;
  virtualCode: VirtualCode;
};

export class CodeReconciler {
  // the virtual code for the current code
  private _virtualCode: VirtualCode = new VirtualCode([]);

  public hasUpdates(virtualCode: VirtualCode) {
    // TODO...
    return true;

    // const stepsToPatch = options.steps.slice(this._commitedStepIndex);
    // TODO....
    // if (!stepsToPatch.length && !options.removeHandle) {
    //   return;
    // }
  }

  private _replaceLastExpression({
    actualCode,
    virtualCode
  }: ReconcileOptions) {
    /**
     * Replace the last expression if it updated.
     */
    const expressions = this._virtualCode.expressions();
    const lastIndex = expressions.length - 1;
    if (lastIndex < 0) return actualCode;

    const expressionToUpdate = expressions[lastIndex];
    const updatedExpression = virtualCode.expressions()[lastIndex];

    const codeToReplace = expressionToUpdate.updatableCode();
    const replaceValue = updatedExpression.updatableCode();

    if (codeToReplace === replaceValue) return actualCode;

    // replace the last occurrence
    const indexToReplace = actualCode.lastIndexOf(codeToReplace);

    // if we cannot find it return original code
    if (indexToReplace < 0) return actualCode;

    const updatedCode =
      actualCode.slice(0, indexToReplace) +
      actualCode.slice(indexToReplace).replace(codeToReplace, replaceValue);

    return updatedCode;
  }

  private _patchNewExpressions({ actualCode, virtualCode }: ReconcileOptions) {
    const existingExpressions = this._virtualCode.expressions();

    const newExpressions = virtualCode
      .expressions()
      .slice(existingExpressions.length);
    if (newExpressions.length < 1) return actualCode;

    const patch =
      newExpressions.map(expression => expression.code()).join("") +
      PATCH_HANDLE;

    return patchCode({ code: actualCode, patch });
  }

  public reconcile({ actualCode, virtualCode }: ReconcileOptions): string {
    // replace the last expression if it updated
    let updatedCode = this._replaceLastExpression({ actualCode, virtualCode });

    updatedCode = this._patchNewExpressions({
      actualCode: updatedCode,
      virtualCode
    });

    return updatedCode;
  }

  public update(virtualCode: VirtualCode) {
    this._virtualCode = virtualCode;
  }
}
