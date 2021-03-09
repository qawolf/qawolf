import Debug from "debug";
import { EventEmitter } from "events";
import { omit } from "lodash";
import { BrowserContext } from "playwright";

import { CodeUpdate, ElementEvent, Variables, WindowEvent } from "../types";
import { ContextEventCollector } from "./ContextEventCollector";
import { parseActionExpressions } from "./parseCode";
import { PATCH_HANDLE } from "./patch";
import { patchEvent, PatchEventOptions } from "./patchEvent";
import { patchFillOrSelectOption } from "./patchFillOrSelectOption";
import { patchPopup } from "./patchPopup";
import { patchReload } from "./patchReload";

const debug = Debug("qawolf:CodeUpdater");

export const updateCode = (options: PatchEventOptions): string | null => {
  const { code, event } = options;
  const patchIndex = code.indexOf(PATCH_HANDLE);
  if (patchIndex < 0) return null;

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
  _testId: string | undefined = "";
  _variables: Variables;
  _version = -1;

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

  _handleEvent(event: ElementEvent | WindowEvent): void {
    if (!this._enabledAt) return;

    if (event.time < this._enabledAt) {
      debug(
        "ignore event triggered before enabled %o",
        omit(event, "frame", "page")
      );
      return;
    }

    debug("handle page event %o", omit(event, "frame", "page"));

    const updatedCode = updateCode({
      code: this._code,
      event,
      expressions: parseActionExpressions(this._code),
      variables: this._variables,
    });

    if (!updatedCode) {
      debug(`skip update: no changes`);
      return;
    }

    this._code = updatedCode;
    this._version += 1;

    const update: CodeUpdate = {
      code: this._code,
      generated: true,
      test_id: this._testId,
      version: this._version,
    };
    this.emit("codeupdated", update);
  }

  disable(): void {
    debug("disable");
    this._enabledAt = false;
  }

  async enable(): Promise<void> {
    debug("enable");
    this._enabledAt = Date.now();
    await this._collectEvents();
  }

  async setContext(context: BrowserContext): Promise<void> {
    this._context = context;
    await this._collectEvents();
  }

  // Called when code is updated by the user
  updateCode(update: CodeUpdate): boolean {
    // Ignore updates that are lower versions that come from a race from multiple connected clients.
    // Allow the update if the test id changes which can happen when running locally and switching tests.
    // In the future we should reset everything when the test changes and move the test_id check.
    if (update.version <= this._version && update.test_id === this._testId) {
      return false;
    }

    debug(`update code ${update.version}`);
    this._code = update.code;
    this._testId = update.test_id;
    this._version = update.version;
    return true;
  }
}
