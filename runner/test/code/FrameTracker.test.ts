/* eslint-disable @typescript-eslint/no-non-null-assertion */
import waitUntil from "async-wait-until";
import { Browser } from "playwright";

import { FrameTracker } from "../../src/code/FrameTracker";
import { launch } from "../../src/environment/launch";
import { getBrowserName, TEST_URL } from "../utils";

const attributes = ["data-qa"];

describe("FrameTracker", () => {
  let browser: Browser;

  beforeAll(async () => {
    const launchResult = await launch({ headless: true });

    browser = launchResult.browser;
  });

  afterAll(() => browser.close());

  it("generates a frame selector for each attached frame", async () => {
    // this only works properly with chromium which is fine since that is what we record with
    if (getBrowserName() !== "chromium") return;

    const context = await browser.newContext();
    const tracker = new FrameTracker({ attributes, context });

    // Frame created before tracking
    const page = await context.newPage();

    await page.goto(`${TEST_URL}iframes`);

    const frame = await (
      await page.waitForSelector('iframe[src="/buttons"]')
    ).contentFrame();
    expect(frame).not.toBeNull();

    await tracker.trackFrames();

    await waitUntil(() => !!tracker._frameSelectors.get(frame!));

    expect(tracker._frameSelectors.get(frame!)).toMatchInlineSnapshot(
      `"[data-qa=\\"first\\"]"`
    );

    // Frame created after tracking
    const page2 = await context.newPage();

    await page2.goto(`${TEST_URL}iframes`);

    const frame2 = await (
      await page.waitForSelector('iframe[src="/buttons"]')
    ).contentFrame();
    expect(frame2).not.toBeNull();

    expect(tracker._frameSelectors.get(frame2!)).toMatchInlineSnapshot(
      `"[data-qa=\\"first\\"]"`
    );

    await page.close();
  });

  it("updates frame selector if a better selector becomes available", async () => {
    // this only works properly with chromium which is fine since that is what we record with
    if (getBrowserName() !== "chromium") return;

    const firstExpectedFrameSelector = '[data-qa="first"]';
    const secondExpectedFrameSelector = '[title="Buttons"]';

    const context = await browser.newContext();
    const tracker = new FrameTracker({ attributes, context });
    await tracker.trackFrames();

    const page = await context.newPage();

    await page.goto(`${TEST_URL}iframes`);

    const frame = await (
      await page.waitForSelector('iframe[src="/buttons"]')
    ).contentFrame();
    expect(frame).not.toBeNull();

    expect(tracker._frameSelectors.get(frame!)).toBe(
      firstExpectedFrameSelector
    );

    // Remove the data-qa attribute so that a less desirable selector
    // will be generated and cached.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    frame!.parentFrame()?.$eval('iframe[src="/buttons"]', (el) => {
      el.removeAttribute("data-qa");
    });

    await waitUntil(
      () => tracker._frameSelectors.get(frame!) !== firstExpectedFrameSelector
    );

    expect(tracker._frameSelectors.get(frame!)).toBe(
      secondExpectedFrameSelector
    );

    // Add back the data-qa attribute
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    frame!.parentFrame()?.$eval('iframe[src="/buttons"]', (el) => {
      el.setAttribute("data-qa", "first");
    });

    await waitUntil(
      () => tracker._frameSelectors.get(frame!) !== secondExpectedFrameSelector
    );

    expect(tracker._frameSelectors.get(frame!)).toBe(
      firstExpectedFrameSelector
    );

    await page.close();
  });

  it("deletes frame references when a frame is disposed", async () => {
    // this only works properly with chromium which is fine since that is what we record with
    if (getBrowserName() !== "chromium") return;

    const context = await browser.newContext();
    const tracker = new FrameTracker({ attributes, context });
    await tracker.trackFrames();

    const page = await context.newPage();

    await page.goto(`${TEST_URL}iframes`);

    const frame = await (
      await page.waitForSelector('iframe[src="/buttons"]')
    ).contentFrame();
    expect(frame).not.toBeNull();

    await waitUntil(() => !!tracker._frameSelectors.get(frame!));

    expect(tracker._frameSelectors.get(frame!)).toBe('[data-qa="first"]');

    await page.evaluate(() => {
      const frameElement = document.querySelector('iframe[src="/buttons"]');
      if (frameElement) frameElement.remove();
    });

    await waitUntil(() => !tracker._frameSelectors.get(frame!));

    expect(tracker._frameSelectors.get(frame!)).toBeUndefined();
  });

  it("deletes frame references when its page is closed", async () => {
    // this only works properly with chromium which is fine since that is what we record with
    if (getBrowserName() !== "chromium") return;

    const context = await browser.newContext();
    const tracker = new FrameTracker({ attributes, context });
    await tracker.trackFrames();

    const page = await context.newPage();

    await page.goto(`${TEST_URL}iframes`);

    const frame = await (
      await page.waitForSelector('iframe[src="/buttons"]')
    ).contentFrame();
    expect(frame).not.toBeNull();

    await waitUntil(() => !!tracker._frameSelectors.get(frame!));

    expect(tracker._frameSelectors.get(frame!)).toBe('[data-qa="first"]');

    await page.close();

    await waitUntil(() => !tracker._frameSelectors.get(frame!));

    expect(tracker._frameSelectors.get(frame!)).toBeUndefined();
  });

  it("doesn't track invisible frames", async () => {
    // this only works properly with chromium which is fine since that is what we record with
    if (getBrowserName() !== "chromium") return;

    const context = await browser.newContext();
    const tracker = new FrameTracker({ attributes, context });

    const page = await context.newPage();

    await page.goto(`${TEST_URL}iframes`);

    const frame = await (
      await page.waitForSelector('iframe[src="/buttons"]')
    ).contentFrame();
    expect(frame).not.toBeNull();

    await page.evaluate(() => {
      (document.querySelector(
        'iframe[src="/buttons"]'
      ) as HTMLElement).style.display = "none";
    });

    await tracker.trackFrames();

    expect(tracker._frameSelectors.get(frame!)).toBeUndefined();

    await page.close();
  });
});
