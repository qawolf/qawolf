import { ActionExpression } from "./ActionExpression";

type ConstructorOptions = {
  action: ActionExpression;
  description: string;
};

export class ScriptExpression {
  private _action: ActionExpression;
  private _description: string;

  constructor({ action, description }: ConstructorOptions) {
    this._action = action;
    this._description = description;
  }

  code() {
    return `// ${this._description}\n${this._action.code()}\n`;
  }

  updatableCode() {
    return this._action.updatableCode();
  }
}
