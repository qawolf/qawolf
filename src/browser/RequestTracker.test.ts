import { Page } from "puppeteer";
import { launchPuppeteerBrowser } from "./browserUtils";
import { RequestTracker } from "./RequestTracker";

jest.useFakeTimers();

let page: Page;

beforeAll(async () => {
  const browser = await launchPuppeteerBrowser();
  page = (await browser.pages())[0];
});

afterAll(() => page.browser().close());

test("waitUntilComplete resolves when there are no outstanding requests", () => {
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

test("waitUntilComplete resolves after outstanding requests are 0", async () => {
  const counter = new RequestTracker();
  counter.track(page);

  page.emit("request", {});
  page.emit("request", {});

  const callback = jest.fn();
  counter.waitUntilComplete(page).then(callback);

  expect(callback).not.toBeCalled();
  page.emit("requestfinished", {});
  page.emit("requestfailed", {});

  return new Promise(resolve => {
    process.nextTick(() => {
      expect(callback).toBeCalled();
      resolve();
    });
  });
});

test("waitUntilComplete resolves after timeout", () => {
  const counter = new RequestTracker();
  counter.track(page);

  page.emit("request", {});

  const callback = jest.fn();
  counter.waitUntilComplete(page, 30000).then(callback);
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
