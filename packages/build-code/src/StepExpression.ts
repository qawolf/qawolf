import { ScrollValue, Step } from "@qawolf/types";
import { buildSelector } from "./buildSelector";
import { Expression } from "./Expression";

const SUPPORTED_ACTIONS = ["click", "scroll", "select", "type"];

type ExpressionOptions = {
  page?: number;
  replace?: boolean;
};

export class StepExpression implements Expression {
  private _previous?: StepExpression;
  private _step: Step;

  public constructor(step: Step, previous?: StepExpression) {
    this._previous = previous;
    this._step = step;

    if (!SUPPORTED_ACTIONS.includes(step.action)) {
      throw new Error(`StepExpression: invalid action ${step.action}`);
    }
  }

  private _buildOptions(): string | void {
    const page = this._step.page;

    let options: ExpressionOptions = {};

    // 1) we need to specify the page if the step has a different page
    // 2) we don't need to, but we specify the page if it is not 0
    //    for clarity and in case they delete steps
    if (this._didPageChange() || page !== 0) {
      options.page = page;
    }

    if (this._step.replace) {
      options.replace = true;
    }

    const optionKeys = Object.keys(options) as (keyof ExpressionOptions)[];
    if (optionKeys.length <= 0) return;

    let serialized = `{ `;

    optionKeys.forEach((key, index) => {
      if (index > 0) serialized += ", ";

      serialized += `${key}: ${options[key]}`;
    });

    serialized += " }";

    return serialized;
  }

  private _buildValue(): string | void {
    const { action, value } = this._step;
    if (action === "scroll") {
      const scrollValue = value as ScrollValue;
      return `{ x: ${scrollValue.x}, y: ${scrollValue.y} }`;
    }

    if (action === "select" || action === "type") {
      return JSON.stringify(value);
    }
  }

  private _didPageChange() {
    if (!this._previous) return false;

    return this._previous.step().page !== this._step.page;
  }

  public code() {
    const { action } = this._step;

    const selector = buildSelector(this._step);
    const value = this._buildValue();
    const options = this._buildOptions();

    let code = `await browser.${action}(${selector}`;

    if (value) {
      code += `, ${value}`;
    }

    if (options) {
      code += `, ${options}`;
    }

    code += ");";

    return code;
  }

  public step() {
    return this._step;
  }

  public updatableCode() {
    return this.code();
  }
}
