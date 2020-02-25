import { CONFIG } from "@qawolf/config";
import playwright, { Browser, Page } from "playwright";
import { RequestTracker } from "../../src/page/RequestTracker";

jest.useFakeTimers();

describe("waitUntilComplete", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await playwright[CONFIG.browser].launch();
    const context = await browser.newContext();
    page = await context.newPage();
  });

  afterAll(() => browser.close());

  it("resolves when there are no outstanding requests", () => {
    const counter = new RequestTracker(page);

    const callback = jest.fn();
    counter.waitUntilComplete().then(callback);

    return new Promise(resolve => {
      process.nextTick(() => {
        expect(callback).toBeCalled();
        resolve();
      });
    });
  });

  it("resolves after outstanding requests are 0", async () => {
    const counter = new RequestTracker(page);

    page.emit("request", 1);
    page.emit("request", 2);

    const callback = jest.fn();
    counter.waitUntilComplete().then(callback);

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
    const counter = new RequestTracker(page, 30000);

    page.emit("request", {});

    const callback = jest.fn();
    counter.waitUntilComplete().then(callback);
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
