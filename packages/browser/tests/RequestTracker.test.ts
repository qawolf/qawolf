import { Page } from "puppeteer";
import { launchPuppeteerBrowser } from "../src/browserUtils";
import { RequestTracker } from "../src/RequestTracker";

jest.useFakeTimers();

describe("waitUntilComplete", () => {
  let page: Page;

  beforeAll(async () => {
    const browser = await launchPuppeteerBrowser();
    page = (await browser.pages())[0];
  });

  afterAll(() => page.browser().close());

  it("resolves when there are no outstanding requests", () => {
    const counter = new RequestTracker();
    counter.track(page);

    const callback = jest.fn();
    counter.waitUntilComplete(page).then(callback);

    return new Promise(resolve => {
      process.nextTick(() => {
        expect(callback).toBeCalled();
        resolve();
      });
    });
  });

  it("resolves after outstanding requests are 0", async () => {
    const counter = new RequestTracker();
    counter.track(page);

    page.emit("request", 1);
    page.emit("request", 2);

    const callback = jest.fn();
    counter.waitUntilComplete(page).then(callback);

    expect(callback).not.toBeCalled();
    page.emit("requestfinished", 1);
    page.emit("requestfailed", 2);

    return new Promise(resolve => {
      process.nextTick(() => {
        expect(callback).toBeCalled();
        resolve();
      });
    });
  });

  it("resolves after timeout", () => {
    const counter = new RequestTracker(30000);
    counter.track(page);

    page.emit("request", {});

    const callback = jest.fn();
    counter.waitUntilComplete(page).then(callback);
    expect(callback).not.toBeCalled();

    expect(callback).not.toBeCalled();

    jest.advanceTimersByTime(31000);
    jest.runOnlyPendingTimers();

    return new Promise(resolve => {
      process.nextTick(() => {
        expect(callback).toBeCalled();
        resolve();
      });
    });
  });
});
