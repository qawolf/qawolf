import { remove } from "lodash";
import { Page, Request } from "puppeteer";
import { logger } from "../logger";

type Callback = () => void;

type Tracker = {
  page: Page;
  requests: Request[];
  onComplete: Callback[];
};

export class RequestTracker {
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

      logger.verbose(
        `RequestTracker: request-- ${reason} ${
          tracker.requests.length
        } ${page.url()}`
      );

      if (tracker.requests.length === 0) {
        tracker.onComplete.forEach(done => done());
        tracker.onComplete = [];
      }
    };

    page.on("request", (request: Request) => {
      tracker.requests.push(request);

      logger.verbose(
        `RequestTracker: request++ ${tracker.requests.length} ${page.url()}`
      );

      setTimeout(() => removeRequest(request, "timeout"), this._timeout);
    });

    page.on("requestfailed", request =>
      removeRequest(request, "requestfailed")
    );

    page.on("requestfinished", request =>
      removeRequest(request, "requestfinished")
    );
  }

  public async waitUntilComplete(page: Page) {
    logger.debug(`RequestTracker: waitUntilComplete ${page.url()}`);

    return new Promise(resolve => {
      const tracker = this._trackers.find(c => c.page === page);
      if (!tracker) throw new Error(`Cannot find counter. Page is not tracked`);

      if (tracker.requests.length === 0) {
        logger.debug(
          `RequestTracker: waitUntilComplete resolved immediately ${page.url()}`
        );
        resolve();
        return;
      }

      tracker.onComplete.push(resolve);
    });
  }
}
