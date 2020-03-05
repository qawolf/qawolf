import { Expression } from './Expression';

type CodeToUpdate = {
  original: string;
  updated: string;
};

export class VirtualCode {
  private _expressions: Expression[] = [];

  constructor(expressions: Expression[]) {
    this._expressions = expressions;
  }

  public code(): string {
    return this._expressions.map(expression => expression.code()).join('');
  }

  public codeToUpdate(compareTo: VirtualCode): CodeToUpdate | null {
    /**
     * Check if the last expression's updatable code changed
     */
    const lastIndex = this._expressions.length - 1;
    if (lastIndex < 0) return null;

    const expressionToUpdate = this._expressions[lastIndex];

    const compareToExpressions = compareTo.expressions();

    if (lastIndex >= compareToExpressions.length) {
      // if the last expression no longer exists
      // we will update it when a new expression arrives
      return null;
    }

    const updatedExpression = compareToExpressions[lastIndex];
    const original = expressionToUpdate.code();
    const updated = updatedExpression.code();
    if (original === updated) return null;

    return { original, updated };
  }

  public newExpressions(compareTo: VirtualCode): Expression[] {
    const newExpressions = compareTo
      .expressions()
      .slice(this._expressions.length);

    return newExpressions;
  }

  public expressions(): Expression[] {
    return this._expressions;
  }
}
