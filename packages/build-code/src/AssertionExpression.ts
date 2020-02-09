import { ActionExpression } from "./ActionExpression";

type ConstructorOptions = {
  action: ActionExpression;
  description: string;
};

export class AssertionExpression {
  private _action: ActionExpression;
  private _description: string;

  constructor({ action, description }: ConstructorOptions) {
    this._action = action;
    this._description = description;
  }

  private _formatIt() {
    const description = this._description;
    if (!description.includes(`"`)) return `"can ${description}"`;
    if (!description.includes("'")) return `'can ${description}'`;
    return JSON.stringify("can " + description);
  }

  code() {
    const code = `\nit(${this._formatIt()}, async () => {\n  ${this._action.code()}\n  });\n`;
    return code;
  }

  updatableCode() {
    return this._action.updatableCode();
  }
}
