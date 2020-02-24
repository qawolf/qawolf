import { logger } from "@qawolf/logger";
import { ElementEvent } from "@qawolf/types";
import { EventEmitter } from "events";
import { omit } from "lodash";
import { Page as PlaywrightPage } from "playwright";
import { injectBundle } from "./injectBundle";
import { RequestTracker } from "./RequestTracker";

// PlaywrightPage decorated with qawolf Page
export interface Page extends PlaywrightPage {
  qawolf(): QAWolfPage;
}

export type CreatePageOptions = {
  index: number;
  logLevel: string;
  playwrightPage: PlaywrightPage;
  shouldRecordEvents?: boolean;
};

export class QAWolfPage extends EventEmitter {
  private _index: number;
  private _playwrightPage: Page;
  private _requests: RequestTracker;

  private _ready: boolean = false;
  private _readyCallbacks: (() => void)[] = [];

  public constructor(options: CreatePageOptions) {
    super();

    logger.verbose(
      `QAWolfPage: create ${JSON.stringify(omit(options, "playwrightPage"))}`
    );

    this._index = options.index;

    // decorate the Playwright Page with a getter for the qawolf page
    this._playwrightPage = options.playwrightPage as Page;
    this._playwrightPage.qawolf = () => this;

    this._requests = new RequestTracker(this._playwrightPage);

    injectBundle({
      logLevel: options.logLevel,
      page: this._playwrightPage,
      shouldRecordEvents: options.shouldRecordEvents
    }).then(() => {
      this._ready = true;
      this._readyCallbacks.forEach(cb => cb());
    });
  }

  public _onRecordEvent(event: ElementEvent) {
    logger.debug(`QAWolfPage: emit "recorded_event" ${event.time}`);
    this.emit("recorded_event", event);
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

  public ready() {
    if (this._ready) return true;

    return new Promise(resolve => this._readyCallbacks.push(resolve));
  }

  public waitForRequests() {
    return this._requests.waitUntilComplete();
  }
}
