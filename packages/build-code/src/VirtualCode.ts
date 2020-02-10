import { Expression } from "./Expression";

export class VirtualCode {
  private _expressions: Expression[] = [];

  constructor(expressions: Expression[]) {
    this._expressions = expressions;
  }

  public code() {
    return this._expressions.map(expression => expression.code()).join("");
  }

  public codeToUpdate(compareTo: VirtualCode) {
    /**
     * Check if the last expression's updatable code changed
     */
    const lastIndex = this._expressions.length - 1;
    if (lastIndex < 0) return null;

    const expressionToUpdate = this._expressions[lastIndex];
    const updatedExpression = compareTo.expressions()[lastIndex];

    const original = expressionToUpdate.updatableCode();
    const updated = updatedExpression.updatableCode();
    if (original === updated) return null;

    const codeToUpdate = { original, updated };
    return codeToUpdate;
  }

  public newExpressions(compareTo: VirtualCode) {
    const newExpressions = compareTo
      .expressions()
      .slice(this._expressions.length);

    return newExpressions;
  }

  public expressions() {
    return this._expressions;
  }
}
