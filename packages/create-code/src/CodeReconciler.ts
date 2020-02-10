import { VirtualCode } from "@qawolf/build-code";
import { patchCode, PATCH_HANDLE } from "./patchCode";

type ReconcileOptions = {
  actualCode: string;
  virtualCode: VirtualCode;
};

export class CodeReconciler {
  // the virtual representation of the current code
  private _virtualCode: VirtualCode = new VirtualCode([]);

  private _compareLastExpression(virtualCode: VirtualCode) {
    const expressions = this._virtualCode.expressions();
    const lastIndex = expressions.length - 1;
    if (lastIndex < 0) return null;

    const expressionToUpdate = expressions[lastIndex];
    const updatedExpression = virtualCode.expressions()[lastIndex];

    const original = expressionToUpdate.updatableCode();
    const updated = updatedExpression.updatableCode();
    if (original === updated) return null;

    return { original, updated };
  }

  private _newExpressions(virtualCode: VirtualCode) {
    const existing = this._virtualCode.expressions();
    const newExpressions = virtualCode.expressions().slice(existing.length);
    return newExpressions;
  }

  private _insertNewExpressions({ actualCode, virtualCode }: ReconcileOptions) {
    const newExpressions = this._newExpressions(virtualCode);
    if (newExpressions.length < 1) return actualCode;

    const patch =
      newExpressions.map(expression => expression.code()).join("") +
      PATCH_HANDLE;

    return patchCode({ code: actualCode, patch });
  }

  private _updateLastExpression({ actualCode, virtualCode }: ReconcileOptions) {
    /**
     * Replace the last expression if changed.
     */
    const comparison = this._compareLastExpression(virtualCode);
    if (!comparison) return actualCode;

    // find the last occurrence of the original expression
    const indexToReplace = actualCode.lastIndexOf(comparison.original);

    // we cannot find the original expression so return the unmodified code
    if (indexToReplace < 0) return actualCode;

    const updatedCode =
      actualCode.slice(0, indexToReplace) +
      actualCode
        .slice(indexToReplace)
        .replace(comparison.original, comparison.updated);

    return updatedCode;
  }

  public hasChanges(virtualCode: VirtualCode) {
    return (
      this._compareLastExpression(virtualCode) ||
      this._newExpressions(virtualCode).length > 0
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
