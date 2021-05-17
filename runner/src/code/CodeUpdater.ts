import Debug from "debug";
import { EventEmitter } from "events";
import { omit } from "lodash";
import { BrowserContext } from "playwright";

import {
  CodeUpdate,
  ElementEvent,
  TextOperation,
  Variables,
  WindowEvent,
} from "../types";
import { ContextEventCollector } from "./ContextEventCollector";
import { parseActionExpressions } from "./parseCode";
import { PATCH_HANDLE } from "./patch";
import { patchEvent, PatchEventOptions } from "./patchEvent";
import { patchFillOrSelectOption } from "./patchFillOrSelectOption";
import { patchPopup } from "./patchPopup";
import { patchReload } from "./patchReload";

const debug = Debug("qawolf:CodeUpdater");

export const updateCode = (options: PatchEventOptions): TextOperation[] => {
  const { code, event } = options;
  const patchIndex = code.indexOf(PATCH_HANDLE);
  if (patchIndex < 0) return [];

  if (["fill", "selectOption"].includes(event.action))
    return patchFillOrSelectOption(options);

  if (event.action === "popup") return patchPopup(options);
  if (event.action === "reload") return patchReload(options);

  return patchEvent(options);
};

export class CodeUpdater extends EventEmitter {
  _code = "";
  _collector?: ContextEventCollector;
  _context?: BrowserContext;
  _enabledAt: number | false = false;
  _variables: Variables;

  constructor(variables: Variables) {
    super();
    this._variables = variables;
  }

  async _collectEvents(): Promise<void> {
    if (this._collector || !this._enabledAt || !this._context) return;

    this._collector = await ContextEventCollector.create(this._context);
    this._collector.on("elementevent", (event) => this._handleEvent(event));
    this._collector.on("windowevent", (event) => this._handleEvent(event));
  }

  _handleEvent(event: ElementEvent | WindowEvent): boolean {
    if (!this._enabledAt || event.time < this._enabledAt) {
      debug(
        "ignore event triggered before enabled %o",
        omit(event, "frame", "page")
      );
      return false;
    }

    debug("handle page event %o", omit(event, "frame", "page"));

    const operations = updateCode({
      code: this._code,
      event,
      expressions: parseActionExpressions(this._code),
      variables: this._variables,
    });

    let updatedCode = this._code;
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

    if (!updatedCode) {
      debug(`skip update: no changes`);
      return false;
    }

    this._code = updatedCode;

    const update: CodeUpdate = { code: this._code };
    this.emit("codeupdated", update);
    return true;
  }

  disable(): void {
    debug("disable");
    this._enabledAt = false;
  }

  async enable(): Promise<void> {
    if (this._enabledAt) return;

    debug("enable");
    this._enabledAt = Date.now();
    await this._collectEvents();
  }

  async setContext(context: BrowserContext): Promise<void> {
    this._context = context;
    await this._collectEvents();
  }

  // Called when code is updated by the user
  updateCode(code: string): boolean {
    debug(`update code to ${code}`);
    this._code = code;
    return true;
  }
}
