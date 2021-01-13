import waitUntil from "async-wait-until";
import { Browser, BrowserContext } from "playwright";

import { ContextEventCollector } from "../../src/code/ContextEventCollector";
import { launch } from "../../src/environment/launch";
import { ElementEvent, WindowEvent } from "../../src/types";
import { getBrowserName, TEST_URL } from "../utils";

describe("ContextEventCollector", () => {
  let browser: Browser;
  let context: BrowserContext;
  let events: ElementEvent[];
  let windowEvents: WindowEvent[];

  beforeAll(async () => {
    const launchResult = await launch({ headless: true });

    browser = launchResult.browser;
    context = launchResult.context;

    const collector = await ContextEventCollector.create(context);
    collector.on("elementevent", (event: ElementEvent) => events.push(event));
    collector.on("windowevent", (event: WindowEvent) =>
      windowEvents.push(event)
    );
  });

  beforeEach(() => {
    events = [];
    windowEvents = [];
  });

  afterAll(() => browser.close());

  it("collects (click) events from multiple pages", async () => {
    for (let i = 0; i < 2; i++) {
      const page = await context.newPage();
      await page.goto(TEST_URL);
      await page.click("a");
      await page.close();
    }

    expect(events.map((e) => e.action)).toEqual(["click", "click"]);

    expect(events[0].page === events[1].page).toEqual(false);

    expect(events.map((e) => e.selector)).toEqual([
      "text=Buttons",
      "text=Buttons",
    ]);
  });

  it("updates frame selector if a better selector becomes available", async () => {
    // this only works properly with chromium which is fine since that is what we record with
    if (getBrowserName() !== "chromium") return;

    const page = await context.newPage();

    await page.goto(`${TEST_URL}iframes`);

    const frame = await (
      await page.waitForSelector('iframe[src="/buttons"]')
    ).contentFrame();
    expect(frame).not.toBe(null);

    // Remove the data-qa attribute so that a less desirable selector
    // will be generated and cached.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    frame!.parentFrame()?.$eval('iframe[src="/buttons"]', (el) => {
      el.removeAttribute("data-qa");
    });

    events = [];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await frame!.click('[data-qa="html-button-with-children"]');
    await waitUntil(() => events.length > 0);
    expect(events[0].frameSelector).toBe('[title="Buttons"]');

    // Add back the data-qa attribute
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    frame!.parentFrame()?.$eval('iframe[src="/buttons"]', (el) => {
      el.setAttribute("data-qa", "first");
    });

    events = [];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await frame!.click('[data-qa="html-button-with-children"]');
    await waitUntil(() => events.length > 0);
    expect(events[0].frameSelector).toBe('[data-qa="first"]');

    await page.close();
  });

  it("collects frame selector and source frame", async () => {
    // this only works properly with chromium which is fine since that is what we record with
    if (getBrowserName() !== "chromium") return;

    const page = await context.newPage();

    await page.goto(`${TEST_URL}iframes`);

    const frame = await (
      await page.waitForSelector('iframe[src="/buttons"]')
    ).contentFrame();
    if (frame) await frame.click('[data-qa="reload-top"]');
    await waitUntil(() => events.length > 0);
    expect(events[0].frameSelector).toEqual('[data-qa="first"]');
    expect(events[0].selector).toEqual('[data-qa="reload-top"]');

    const frame2 = await (
      await page.waitForSelector('iframe[src="/buttons"]')
    ).contentFrame();
    if (frame2) await frame2.click('[data-qa="reload-top"]');
    await waitUntil(
      () => events.filter((e) => e.action === "click").length > 1
    );

    const clickEvents = events.filter((e) => e.action === "click");

    expect(clickEvents[1].frame === clickEvents[0].frame).toEqual(false);
    expect(clickEvents[1].frameSelector).toEqual(clickEvents[0].frameSelector);
    expect(clickEvents[1].selector).toEqual(clickEvents[0].selector);

    await page.close();
  });

  it("collects back button press and new tab with typed address", async () => {
    // only test this on chrome for now
    if (getBrowserName() !== "chromium") return;

    const page = await context.newPage();

    await page.goto(TEST_URL);
    await page.goto(`${TEST_URL}text-inputs`);
    await page.goBack();
    await page.close();

    expect(windowEvents.pop()?.action).toBe("goBack");
    expect(windowEvents.pop()?.action).toBe("goto");
  });

  it("collects a new typed address after back button press (rewritten browser history)", async () => {
    // only test this on chrome for now
    if (getBrowserName() !== "chromium") return;

    const page = await context.newPage();

    await page.goto(TEST_URL);
    await page.goBack();
    await page.goto(`${TEST_URL}text-inputs`);
    await page.close();

    expect(windowEvents.pop()?.action).toBe("goto");
    expect(windowEvents.pop()?.action).toBe("goBack");
    expect(windowEvents.pop()?.action).toBe("goto");
  });

  it("collects reload button", async () => {
    // only test this on chrome for now
    if (getBrowserName() !== "chromium") return;

    const page = await context.newPage();

    await page.goto(TEST_URL);
    await page.reload();
    await page.close();

    expect(windowEvents.pop()?.action).toBe("reload");
  });

  it("collects popup from window.open", async () => {
    const page = await context.newPage();

    await page.goto(TEST_URL);

    const [page2] = await Promise.all([
      page.waitForEvent("popup"),
      page.evaluate(() => {
        window.open("https://movablebooksociety.org/");
      }),
    ]);

    // To be safe, make sure we've collected the popup event by now
    await waitUntil(() =>
      windowEvents.find((event) => event.action === "popup")
    );

    await page.close();
    await page2.close();

    expect(windowEvents.pop()?.action).toBe("popup");
  });

  it("collects popup from blank target click", async () => {
    const page = await context.newPage();

    await page.setContent(`
      <html>
        <body>
          <a href="https://movablebooksociety.org/" target="_blank">Pop-ups</a>
        </body>
      </html>
    `);

    const [page2] = await Promise.all([
      page.waitForEvent("popup"),
      page.click("a"),
    ]);

    // To be safe, make sure we've collected the popup event by now
    await waitUntil(() =>
      windowEvents.find((event) => event.action === "popup")
    );

    await page.close();
    await page2.close();

    expect(windowEvents.pop()?.action).toBe("popup");
  });
});
