import { isUndefined } from 'util';
import { ScrollValue, Step } from '../types';

const SUPPORTED_ACTIONS = [
  'click',
  'fill',
  'press',
  'scroll',
  'select',
  'type',
];

export class Expression {
  private _previous?: Expression;
  private _step: Step;

  public constructor(step: Step, previous?: Expression) {
    this._previous = previous;
    this._step = step;

    if (!SUPPORTED_ACTIONS.includes(step.action)) {
      throw new Error(`Invalid action ${step.action}`);
    }
  }

  private _buildSelector(): string {
    const { cssSelector } = this._step;
    if (cssSelector) return `"${cssSelector}"`;

    // lookup html selector by index
    return `selectors[${this._step.index}]`;
  }

  private _buildValue(): string {
    const { action, value } = this._step;

    if (action === 'scroll') {
      const scrollValue = value as ScrollValue;
      return `{ x: ${scrollValue.x}, y: ${scrollValue.y} }`;
    }

    if (isUndefined(value)) return '';

    return JSON.stringify(value);
  }

  private _didPageChange(): boolean {
    if (!this._previous) return false;

    return this._previous.step().page !== this._step.page;
  }

  public code(): string {
    if (this._didPageChange()) {
      // TODO handle page change
    }

    const { action } = this._step;

    const args: string[] = [this._buildSelector()];

    const value = this._buildValue();
    if (value.length) args.push(value);

    let methodOpen = `page.${action}(`;
    if (action === 'scroll') {
      methodOpen = `qawolf.scroll(page, `;
    }

    const expression = `await ${methodOpen}${args.join(', ')});`;

    // TODO description
    return `${expression}\n`;
  }

  public step(): Step {
    return this._step;
  }
}
