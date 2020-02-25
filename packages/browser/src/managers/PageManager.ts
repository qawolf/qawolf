import { browserLogger, logger } from "@qawolf/logger";
import { ElementEvent } from "@qawolf/types";
import { EventEmitter } from "events";
import { omit } from "lodash";
import { Page as PlaywrightPage } from "playwright";
import { injectBundle } from "./injectBundle";
import { RequestTracker } from "./RequestTracker";

export type CreatePageOptions = {
  index: number;
  logLevel: string;
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
  private _index: number;
  private _page: Page;
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
  }

  public static async create(options: CreatePageOptions) {
    const manager = new PageManager(options);

    await manager._exposeFunctions();

    await injectBundle({
      logLevel: options.logLevel,
      page: options.page
    });

    return manager;
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

  public async bringToFront() {
    // TODO waiting for https://github.com/microsoft/playwright/issues/657 for cross browser support
    // logger.verbose(`Page: bringToFront ${this.index()}`);
    // const client = await (this.browser() as CRBrowser)
    //   .pageTarget(page)
    //   .createCDPSession();
    // await client.send("Page.bringToFront");
    // client.detach();
  }

  public dispose() {
    this.removeAllListeners();
    this._requests.dispose();
  }

  public index() {
    return this._index;
  }

  public page(): Page {
    return this._page;
  }

  public recordEvents() {
    // TODO inject on demand if not already done
    // const buildRecordEventsJs = (pageIndex: number) =>
    //   `window.qaw_recorder = window.qaw_recorder || new qawolf.Recorder("${CONFIG.attribute}", ${pageIndex}, (event) => qaw_onRecordEvent(event));`;
  }

  public waitForRequests() {
    return this._requests.waitUntilComplete();
  }
}
