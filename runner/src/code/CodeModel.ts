import Debug from "debug";
import { EventEmitter } from "events";

import { CodeUpdate, TextOperation } from "../types";

const debug = Debug("qawolf:CodeModel");

export class CodeModel extends EventEmitter {
  _value = "";

  update(operations: TextOperation[]): boolean {
    if (!operations.length) {
      debug(`skip update: no changes`);
      return false;
    }

    let updatedCode = this._value;
    operations.forEach((op) => {
      if (op.type === "delete") {
        updatedCode =
          updatedCode.substring(0, op.index) +
          updatedCode.substring(op.index + op.length);
      } else if (op.type === "insert") {
        updatedCode =
          updatedCode.substring(0, op.index) +
          op.value +
          updatedCode.substring(op.index);
      }
    });

    this._value = updatedCode;
    const update: CodeUpdate = { code: this._value };
    this.emit("codeupdated", update);
    return true;
  }

  setValue(code: string): void {
    this._value = code;
  }

  get value(): string {
    return this._value;
  }
}
