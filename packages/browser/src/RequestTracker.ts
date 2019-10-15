import { logger } from "@qawolf/logger";
import { remove } from "lodash";
import { Page, Request, PageEventObj } from "puppeteer";

type Callback = () => void;

type Tracker = {
  page: Page;
  requests: Request[];
  onComplete: Callback[];
};

export class RequestTracker {
  private _onDispose: (() => void)[] = [];

  private _trackers: Tracker[] = [];

  // how long until we ignore a request
  private _timeout: number;

  constructor(timeout: number = 10000) {
    this._timeout = timeout;
  }

  public track(page: Page) {
    const tracker: Tracker = {
      page,
      requests: [],
      onComplete: []
    };
    this._trackers.push(tracker);

    const removeRequest = (request: Request, reason: string) => {
      const items = remove(tracker.requests, i => i === request);
      // ignore since it was already removed
      if (items.length < 1) return;

      logger.debug(
        `RequestTracker: request-- ${reason} ${
          tracker.requests.length
        } ${page.url().substring(0, 100)}`
      );

      if (tracker.requests.length === 0) {
        tracker.onComplete.forEach(done => done());
        tracker.onComplete = [];
      }
    };

    this.on(page, "request", (request: Request) => {
      tracker.requests.push(request);

      logger.debug(
        `RequestTracker: request++ ${
          tracker.requests.length
        } ${page.url().substring(0, 100)}`
      );

      const intervalId = setTimeout(
        () => removeRequest(request, "timeout"),
        this._timeout
      );
      this._onDispose.push(() => clearInterval(intervalId));
    });

    this.on(page, "requestfailed", request =>
      removeRequest(request, "requestfailed")
    );

    this.on(page, "requestfinished", request =>
      removeRequest(request, "requestfinished")
    );
  }

  public async waitUntilComplete(page: Page) {
    logger.verbose(`RequestTracker: waitUntilComplete ${page.url()}`);

    return new Promise(resolve => {
      const tracker = this._trackers.find(c => c.page === page);
      if (!tracker) throw new Error(`Cannot find counter. Page is not tracked`);

      if (tracker.requests.length === 0) {
        logger.verbose(
          `RequestTracker: waitUntilComplete resolved immediately ${page.url()}`
        );
        resolve();
        return;
      }

      tracker.onComplete.push(resolve);
    });
  }

  public dispose() {
    this._onDispose.forEach(f => f());
  }

  private on<K extends keyof PageEventObj>(
    page: Page,
    eventName: K,
    handler: (e: PageEventObj[K], ...args: any[]) => void
  ) {
    page.on(eventName, handler);

    this._onDispose.push(() => page.removeListener(eventName, handler));
  }
}
