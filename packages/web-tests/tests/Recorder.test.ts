import { launch, selectElementContent } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { InputEvent, KeyEvent, PasteEvent, ScrollEvent } from "@qawolf/types";
import { isKeyEvent, sleep } from "@qawolf/web";

describe("Recorder", () => {
  it("records actions on another page", async () => {
    const context = await launch({ shouldRecordEvents: true });

    const page = await context.newPage();

    // ensure page is decorated
    await context.qawolf().pages();

    await page.goto(`${CONFIG.sandboxUrl}text-inputs`);
    await page.type('css=[data-qa="html-text-input"]', "sup");

    await context.close();

    const events = await context.qawolf().recordedEvents();
    expect(events.length).toBeGreaterThan(0);
  });

  it("records click on a link", async () => {
    const context = await launch({
      shouldRecordEvents: true,
      url: CONFIG.sandboxUrl
    });

    const page = await context.page();

    await Promise.all([
      page.waitForNavigation(),
      context.click({ html: "<a>Content editables</a>" }, { simulate: false })
    ]);

    await context.close();

    const events = await context.qawolf().recordedEvents();
    expect(events.length).toEqual(1);
    expect(events[0].name).toEqual("click");
    expect(events[0].target.node.attrs.href).toEqual("/content-editables");
  });

  it("records paste", async () => {
    const context = await launch({
      shouldRecordEvents: true,
      url: `${CONFIG.sandboxUrl}text-inputs`
    });

    const page = await context.page();

    // tried a lot of ways to test this
    // sending Meta+V did not work
    // robotjs was not able to install for node v12
    // so we simulate a paste event instead
    await page.evaluate(() => {
      const event = new Event("paste") as any;
      event.clipboardData = { getData: () => "secret" };
      document
        .querySelector('[data-qa="html-text-input"]')!
        .dispatchEvent(event);
    });

    // make sure we can access the events after the pages are closed
    await context.close();

    const events = await context.qawolf().recordedEvents();
    expect(events[0].target.node.attrs["data-qa"]).toEqual("html-text-input");
    expect((events[0] as PasteEvent).value).toEqual("secret");
  });

  it("records scroll event", async () => {
    // only test this on chrome for now
    if (CONFIG.browser !== "chromium") return;

    const context = await launch({
      shouldRecordEvents: true,
      url: `${CONFIG.testUrl}large`
    });

    const page = await context.page();

    const client = await (context.browser() as any)
      .pageTarget(page)
      .createCDPSession();

    // scroll a few times to make sure we capture it
    for (let i = 0; i < 3; i++) {
      // from https://github.com/puppeteer/puppeteer/issues/4119#issue-417279184
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseWheel",
        deltaX: 0,
        deltaY: 500,
        x: 0,
        y: 0
      });

      // give time for scroll
      await sleep(1000);
    }

    await context.close();

    const events = await context.qawolf().recordedEvents();

    const { isTrusted, name, target, value } = events[
      events.length - 1
    ] as ScrollEvent;

    expect(name).toEqual("scroll");
    expect(target.node.name).toEqual("html");
    expect(value.x).toEqual(0);

    // the page doesn't scroll perfectly so we can't check the exact y
    expect(value.y).toBeGreaterThan(200);
    expect(isTrusted).toEqual(true);
  });

  it("records input event for select", async () => {
    const context = await launch({
      shouldRecordEvents: true,
      url: `${CONFIG.sandboxUrl}selects`
    });
    await context.select({ css: '[data-qa="html-select"]' }, "hedgehog");

    await context.close();

    const events = await context.qawolf().recordedEvents();

    const { name, isTrusted, target, value } = events[
      events.length - 1
    ] as InputEvent;

    expect(isTrusted).toEqual(false);
    expect(name).toEqual("input");
    expect(target.node.attrs["data-qa"]).toEqual("html-select");
    expect(value).toEqual("hedgehog");
  });

  it("records selectall for text input", async () => {
    // XXX use keyboard shortcuts if/when https://github.com/microsoft/playwright/issues/1067 is resolved
    // selectElementContent does not trigger "select" on webkit
    if (CONFIG.browser === "webkit") return;

    const context = await launch({
      shouldRecordEvents: true,
      url: `${CONFIG.sandboxUrl}text-inputs`
    });

    const element = await context.find({
      css: '[data-qa="html-text-input-filled"]'
    });
    await selectElementContent(element);
    await context.close();

    const events = await context.qawolf().recordedEvents();
    const { isTrusted, name, target } = events[events.length - 1] as InputEvent;
    expect(name).toEqual("selectall");
    expect(isTrusted).toEqual(true);
    expect(target.node.attrs["data-qa"]).toEqual("html-text-input-filled");
  });

  it("records type", async () => {
    const context = await launch({
      shouldRecordEvents: true,
      url: `${CONFIG.sandboxUrl}text-inputs`
    });

    await context.type({ css: '[data-qa="html-text-input"]' }, "sup");
    await context.type({ css: '[data-qa="html-text-input"]' }, "↓Tab↑Tab");
    await context.type({ css: "body" }, "yo");

    await context.close();

    const events = await context.qawolf().recordedEvents();

    expect(events[0].target.node.attrs["data-qa"]).toEqual("html-text-input");
    expect(
      (events.filter(e => isKeyEvent(e)) as KeyEvent[]).map(e => e.value)
    ).toEqual(["s", "s", "u", "u", "p", "p", "Tab", "Tab", "y", "y", "o", "o"]);
  });
});
