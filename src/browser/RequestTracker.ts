import { once } from "lodash";
import { Page } from "puppeteer";
import { logger } from "../logger";

type Callback = () => void;

type Counter = {
  page: Page;
  requests: number;
  onComplete: Callback[];
};

export class RequestTracker {
  private counters: Counter[] = [];

  public track(page: Page) {
    const counter = {
      page,
      requests: 0,
      onComplete: [] as Callback[]
    };
    this.counters.push(counter);

    const decrementRequests = () => {
      counter.requests -= 1;
      logger.debug(
        `RequestTracker: requests-- ${counter.requests} ${page.url()}`
      );

      if (counter.requests === 0) {
        counter.onComplete.forEach(done => done());
        counter.onComplete = [];
      }
    };

    page.on("request", () => {
      counter.requests += 1;
      logger.debug(
        `RequestTracker: requests++ ${counter.requests} ${page.url()}`
      );
    });

    page.on("requestfailed", decrementRequests);
    page.on("requestfinished", decrementRequests);
  }

  public async waitUntilComplete(page: Page, timeout: number = 10000) {
    logger.debug(`RequestTracker: waitUntilComplete ${page.url()}`);

    return new Promise(resolve => {
      const counter = this.counters.find(c => c.page === page);
      if (!counter) throw new Error(`Cannot find counter. Page is not tracked`);

      if (counter.requests === 0) {
        logger.debug(
          `RequestTracker: waitUntilComplete resolved immediately ${page.url()}`
        );
        resolve();
        return;
      }

      counter.onComplete.push(once(resolve));

      const timeoutId = setTimeout(() => {
        logger.debug(
          `RequestTracker: waitUntilComplete resolved after timeout ${page.url()}`
        );
        counter.onComplete.forEach(done => done());
        counter.onComplete = [];
      }, timeout);

      counter.onComplete.push(() => clearTimeout(timeoutId));
    });
  }
}
