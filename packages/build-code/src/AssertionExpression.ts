import { buildDescription } from "./buildDescription";
import { Expression } from "./Expression";
import { StepExpression } from "./StepExpression";

export class AssertionExpression implements Expression {
  private _stepExpression: StepExpression;

  constructor(stepExpression: StepExpression) {
    this._stepExpression = stepExpression;
  }

  private _formatIt() {
    const step = this._stepExpression.step();
    const description = buildDescription(step);
    if (!description.includes(`"`)) return `"can ${description}"`;
    if (!description.includes("'")) return `'can ${description}'`;
    return JSON.stringify("can " + description);
  }

  code() {
    return `\nit(${this._formatIt()}, async () => {\n  ${this._stepExpression.code()}\n});\n`;
  }

  updatableCode() {
    return this._stepExpression.updatableCode();
  }
}
