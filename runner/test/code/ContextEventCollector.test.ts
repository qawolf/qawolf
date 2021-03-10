import waitUntil from "async-wait-until";
import { Page } from "playwright";

import { ContextEventCollector } from "../../src/code/ContextEventCollector";
import { getBrowserName } from "../../src/environment/launch";
import { ElementEvent, WindowEvent } from "../../src/types";
import {
  FixturesServer,
  launch,
  LaunchResult,
  serveFixtures,
  setBody,
  sleep,
} from "../utils";

let events: ElementEvent[];
let page: Page;
let launched: LaunchResult;
let server: FixturesServer;

let windowEvents: WindowEvent[];

beforeAll(async () => {
  launched = await launch();
  page = launched.page;
  server = await serveFixtures();

  const collector = await ContextEventCollector.create(launched.context);
  collector.on("elementevent", (event: ElementEvent) => events.push(event));
  collector.on("windowevent", (event: WindowEvent) => windowEvents.push(event));
});

beforeEach(async () => {
  events = [];
  windowEvents = [];
  await page.goto(`${server.url}/ContextEventCollector`);
});

afterAll(async () => {
  server.close();
  await launched.browser.close();
});

it("collects (click) events from multiple pages", async () => {
  await page.click("button");

  const page2 = await launched.context.newPage();
  await page2.goto(`${server.url}/ContextEventCollector`);
  await page2.click("button");
  await page2.close();

  expect(events.map((e) => e.action)).toEqual(["click", "click"]);
  expect(events[0].page === events[1].page).toEqual(false);
  expect(events.map((e) => e.selector)).toEqual(["text=Hello", "text=Hello"]);
});

it("collects frame selector and source frame", async () => {
  // XXX maybe remove this check
  // only test this on chrome for now
  if (getBrowserName() !== "chromium") return;
  const page = launched.page;

  const frame = await (await page.waitForSelector("iframe")).contentFrame();
  if (frame) await frame.click("text=Do Nothing");
  await waitUntil(() => events.length > 0);
  expect(events[0].frameSelector).toEqual('[data-qa="frame"]');
  expect(events[0].selector).toEqual("text=Do Nothing");

  // work for multiple frames
  const frame2 = await (
    await page.waitForSelector('[data-qa="frame2"]')
  ).contentFrame();
  if (frame2) await frame2.click("text=Do Nothing");
  await waitUntil(() => events.length > 1);
  expect(events[1].frame === events[0].frame).toEqual(false);
  expect(events[1].frameSelector).toEqual('[data-qa="frame2"]');
  expect(events[1].selector).toEqual(events[0].selector);

  // falls back to url when the frame is disposed
  if (frame) await frame.click('[data-qa="reload-top"]');
  await waitUntil(() => events.length > 2);
  expect(events[2].frameSelector).toEqual(`[url="${server.url}/frame"`);
  expect(events[2].selector).toEqual('[data-qa="reload-top"]');
});

it("collects back button press and new tab with typed address", async () => {
  // only test this on chrome for now
  if (getBrowserName() !== "chromium") return;

  await page.goBack();
  await sleep(0);

  expect(windowEvents.pop()?.action).toBe("goBack");
  expect(windowEvents.pop()?.action).toBe("goto");
});

it("collects a new typed address after back button press (rewritten browser history)", async () => {
  // only test this on chrome for now
  if (getBrowserName() !== "chromium") return;

  await page.goBack();
  await page.goto(`${server.url}/empty`);

  await sleep(0);

  const lastEvent = windowEvents.pop();
  expect(lastEvent?.action).toBe("goto");
  expect(lastEvent?.value).toBe(`${server.url}/empty`);

  expect(windowEvents.pop()?.action).toBe("goBack");
  expect(windowEvents.pop()?.action).toBe("goto");
});

it("collects reload button", async () => {
  // only test this on chrome for now
  if (getBrowserName() !== "chromium") return;

  await page.reload();
  await sleep(0);

  expect(windowEvents.pop()?.action).toBe("reload");
});

it("collects popup from window.open", async () => {
  const [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.evaluate(() => {
      window.open("https://movablebooksociety.org/");
    }),
  ]);

  // To be safe, make sure we've collected the popup event by now
  await waitUntil(() => windowEvents.find((event) => event.action === "popup"));

  await page2.close();

  await sleep(0);

  expect(windowEvents.pop()?.action).toBe("popup");
});

it("collects popup from blank target click", async () => {
  await setBody(
    page,
    `<a href="https://movablebooksociety.org/" target="_blank">Pop-ups</a>`
  );

  const [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.click("a"),
  ]);

  // To be safe, make sure we've collected the popup event by now
  await waitUntil(() => windowEvents.find((event) => event.action === "popup"));
  await page2.close();

  await sleep(0);

  expect(windowEvents.pop()?.action).toBe("popup");
});
