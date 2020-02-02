import { logger } from "@qawolf/logger";
import { Callback } from "@qawolf/types";
import { remove } from "lodash";
import { Page as PlaywrightPage, Request } from "playwright";

export class RequestTracker {
  private _onComplete: Callback[] = [];
  private _onDispose: (() => void)[] = [];

  private _page: PlaywrightPage;

  private _requests: Request[] = [];

  // how long until we ignore a request
  private _timeout: number;

  constructor(page: PlaywrightPage, timeout: number = 5000) {
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

    if (this._requests.length === 0) {
      this._onComplete.forEach(done => done());
      this._onComplete = [];
    }
  }

  private on(event: string, listener: (...args: any[]) => void) {
    this._page.on(event, listener);

    this._onDispose.push(() => this._page.removeListener(event, listener));
  }
}
