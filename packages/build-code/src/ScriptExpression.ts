import { buildDescription } from "./buildDescription";
import { Expression } from "./Expression";
import { StepExpression } from "./StepExpression";

export class ScriptExpression implements Expression {
  private _stepExpression: StepExpression;

  constructor(stepExpression: StepExpression) {
    this._stepExpression = stepExpression;
  }

  code() {
    const description = buildDescription(this._stepExpression.step());
    return `// ${description}\n${this._stepExpression.code()}\n`;
  }

  updatableCode() {
    return this._stepExpression.updatableCode();
  }
}
