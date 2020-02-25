import { browserLogger, logger } from "@qawolf/logger";
import { ElementEvent } from "@qawolf/types";
import { EventEmitter } from "events";
import { omit } from "lodash";
import { Page as PlaywrightPage } from "playwright";
import {
  buildCaptureLogsScript,
  buildRecordEventsScript,
  QAWOLF_WEB_SCRIPT
} from "./buildScript";
import { includeScript } from "./includeScript";
import { logTestStarted } from "./logTestStarted";
import { RequestTracker } from "./RequestTracker";

export type CreatePageOptions = {
  index: number;
  logLevel?: string;
  page: PlaywrightPage;
};

// Playwright Page decorated with our PageManager
export interface Page extends PlaywrightPage {
  qawolf(): PageManager;
}

export class PageManager extends EventEmitter {
  /**
   * Inject the qawolf bundle and emit recorder events.
   */
  // public for tests
  public _disposed: boolean = false;
  private _index: number;
  private _page: Page;
  private _recordingEvents: boolean = false;
  private _requests: RequestTracker;

  protected constructor(options: CreatePageOptions) {
    super();

    logger.verbose(
      `PageManager: manage ${JSON.stringify(omit(options, "page"))}`
    );

    this._index = options.index;

    // decorate a getter for this manager
    this._page = options.page as Page;
    this._page.qawolf = () => this;

    this._requests = new RequestTracker(this._page);

    this._page.on("close", () => this._dispose());

    logTestStarted(this._page);
  }

  public static async create(options: CreatePageOptions) {
    const manager = new PageManager(options);

    await manager._exposeFunctions();

    await includeScript(
      options.page,
      QAWOLF_WEB_SCRIPT + buildCaptureLogsScript(options.logLevel || "error")
    );

    return manager;
  }

  private _dispose() {
    this._disposed = true;
    this.removeAllListeners();
    this._requests.dispose();
  }

  protected async _exposeFunctions() {
    const logFnPromise = this._page.exposeFunction(
      "qaw_log",
      (level: string, message: string) => browserLogger.log(level, message)
    );

    const recordEventFnPromise = this._page.exposeFunction(
      "qaw_onRecordEvent",
      (event: ElementEvent) => {
        logger.debug(`PageManager: emit "recorded_event" ${event.time}`);
        this.emit("recorded_event", event);
      }
    );

    await Promise.all([logFnPromise, recordEventFnPromise]);
  }

  public index() {
    return this._index;
  }

  public page(): Page {
    return this._page;
  }

  public async recordEvents() {
    if (this._recordingEvents) return;
    this._recordingEvents = true;
    await includeScript(this._page, buildRecordEventsScript(this._index));
  }

  public waitForRequests() {
    return this._requests.waitUntilComplete();
  }
}
