import { logger } from "@qawolf/logger";
import { Callback } from "@qawolf/types";
import { remove } from "lodash";
import { Page as PuppeteerPage, Request, PageEventObj } from "puppeteer";

export class RequestTracker {
  private _onComplete: Callback[] = [];
  private _onDispose: (() => void)[] = [];

  private _page: PuppeteerPage;

  private _requests: Request[] = [];

  // how long until we ignore a request
  private _timeout: number;

  constructor(page: PuppeteerPage, timeout: number = 5000) {
    this._page = page;
    this._timeout = timeout;

    this.on("request", (request: Request) => this.handleRequest(request));

    this.on("requestfailed", request =>
      this.handleRemoveRequest(request, "requestfailed")
    );

    this.on("requestfinished", request =>
      this.handleRemoveRequest(request, "requestfinished")
    );
  }

  public dispose() {
    this._onDispose.forEach(f => f());
  }

  public async waitUntilComplete() {
    logger.verbose(`RequestTracker: waitUntilComplete ${this._page.url()}`);

    return new Promise(resolve => {
      if (this._requests.length === 0) {
        logger.verbose(
          `RequestTracker: waitUntilComplete resolved immediately ${this._page.url()}`
        );
        resolve();
        return;
      }

      this._onComplete.push(resolve);
    });
  }

  private handleRequest(request: Request) {
    this._requests.push(request);

    logger.debug(
      `RequestTracker: request++ ${
        this._requests.length
      } ${this._page.url().substring(0, 100)}`
    );

    const intervalId = setTimeout(
      () => this.handleRemoveRequest(request, "timeout"),
      this._timeout
    );
    this._onDispose.push(() => clearInterval(intervalId));
  }

  private handleRemoveRequest(request: Request, reason: string) {
    const items = remove(this._requests, i => i === request);
    // ignore since it was already removed
    if (items.length < 1) return;

    logger.debug(
      `RequestTracker: request-- ${reason} ${
        this._requests.length
      } ${this._page.url().substring(0, 100)}`
    );

    if (this._requests.length === 0) {
      this._onComplete.forEach(done => done());
      this._onComplete = [];
    }
  }

  private on<K extends keyof PageEventObj>(
    eventName: K,
    handler: (e: PageEventObj[K], ...args: any[]) => void
  ) {
    this._page.on(eventName, handler);

    this._onDispose.push(() => this._page.removeListener(eventName, handler));
  }
}
