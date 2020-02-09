import { Expression } from "./Expression";

export class VirtualCode {
  private _expressions: Expression[] = [];

  constructor(expressions: Expression[]) {
    this._expressions = expressions;
  }

  public code() {
    // TODO....
  }

  public compare(other: VirtualCode) {
    // return new and changed expressions
  }

  public expressions() {
    return this._expressions;
  }
}
