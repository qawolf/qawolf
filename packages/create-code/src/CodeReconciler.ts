import { VirtualCode } from "@qawolf/build-code";
import { patchCode, PATCH_HANDLE } from "./patchCode";

type ReconcileOptions = {
  actualCode: string;
  virtualCode: VirtualCode;
};

export class CodeReconciler {
  // the virtual representation of the current code
  private _virtualCode: VirtualCode = new VirtualCode([]);

  private _insertNewExpressions({ actualCode, virtualCode }: ReconcileOptions) {
    const newExpressions = this._virtualCode.newExpressions(virtualCode);
    if (newExpressions.length < 1) return actualCode;

    const patch =
      newExpressions.map(expression => expression.code()).join("") +
      PATCH_HANDLE;

    return patchCode({ code: actualCode, patch });
  }

  private _updateLastExpression({ actualCode, virtualCode }: ReconcileOptions) {
    /**
     * Update the last expression if it changed.
     */
    const codeToUpdate = this._virtualCode.codeToUpdate(virtualCode);
    if (!codeToUpdate) return actualCode;

    // find the last occurrence of the original expression
    const indexToReplace = actualCode.lastIndexOf(codeToUpdate.original);

    // we cannot find the original expression so return the unmodified code
    if (indexToReplace < 0) return actualCode;

    const updatedCode =
      actualCode.slice(0, indexToReplace) +
      actualCode
        .slice(indexToReplace)
        .replace(codeToUpdate.original, codeToUpdate.updated);

    return updatedCode;
  }

  public hasChanges(virtualCode: VirtualCode) {
    return (
      this._virtualCode.codeToUpdate(virtualCode) ||
      this._virtualCode.newExpressions(virtualCode).length > 0
    );
  }

  public reconcile({ actualCode, virtualCode }: ReconcileOptions): string {
    let updatedCode = this._updateLastExpression({ actualCode, virtualCode });

    updatedCode = this._insertNewExpressions({
      actualCode: updatedCode,
      virtualCode
    });

    return updatedCode;
  }

  public update(virtualCode: VirtualCode) {
    this._virtualCode = virtualCode;
  }
}
