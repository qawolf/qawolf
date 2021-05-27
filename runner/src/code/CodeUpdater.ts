import Debug from "debug";
import { EventEmitter } from "events";
import { omit } from "lodash";
import { BrowserContext } from "playwright";

import { ElementEvent, Variables, WindowEvent } from "../types";
import { FileModel } from "./FileModel";
import { ContextEventCollector } from "./ContextEventCollector";
import { parseActionExpressions } from "./parseCode";
import { patchEvent } from "./patchEvent";

type CodeUpdaterOptions = {
  testModel: FileModel;
  variables: Variables;
};

const debug = Debug("qawolf:CodeUpdater");

export class CodeUpdater extends EventEmitter {
  _collector?: ContextEventCollector;
  _context?: BrowserContext;
  _enabledAt: number | false = false;
  _testModel: FileModel;
  _variables: Variables;

  constructor({ testModel, variables }: CodeUpdaterOptions) {
    super();
    this._testModel = testModel;
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

    const code = this._testModel.content;

    const operations = patchEvent({
      code,
      event,
      expressions: parseActionExpressions(code),
      variables: this._variables,
    });

    return this._testModel.update(operations);
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
}
