import { launch } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { InputEvent, KeyEvent, PasteEvent, ScrollEvent } from "@qawolf/types";
import { isKeyEvent, sleep } from "@qawolf/web";

describe("Recorder", () => {
  it("records click on a link", async () => {
    const context = await launch({
      recordEvents: true,
      url: CONFIG.testUrl
    });
    await context.click({ html: "<a>broken images</a>" }, { simulate: false });

    const page = await context.page();
    await page.waitForNavigation();

    const events = await context.qawolf.events();
    expect(events.length).toEqual(1);
    expect(events[0].name).toEqual("click");
    expect(events[0].target.node.attrs.href).toEqual("/broken_images");

    await context.close();
  });

  it("records paste", async () => {
    const context = await launch({
      recordEvents: true,
      url: `${CONFIG.testUrl}login`
    });

    const page = await context.page();

    // tried a lot of ways to test this
    // sending Meta+V did not work
    // robotjs was not able to install for node v12
    // so we simulate a paste event instead
    await page.evaluate(() => {
      const event = new Event("paste") as any;
      event.clipboardData = { getData: () => "secret" };
      document.querySelector("#password")!.dispatchEvent(event);
    });

    // make sure we can access the events after the pages are closed
    await context.close();

    const events = await context.qawolf.events();
    expect(events[0].target.node.attrs.id).toEqual("password");
    expect((events[0] as PasteEvent).value).toEqual("secret");
  });

  it("records scroll", async () => {
    // only test this on chrome for now
    if (CONFIG.browser !== "chromium") return;

    const context = await launch({
      recordEvents: true,
      url: `${CONFIG.testUrl}large`
    });

    const page = await context.page();

    const client = await (context.browser as any)
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

    const events = await context.qawolf.events();

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

  it("records select option", async () => {
    const context = await launch({
      recordEvents: true,
      url: `${CONFIG.testUrl}dropdown`
    });
    await context.select({ css: "#dropdown" }, "2");

    await context.close();

    const events = await context.qawolf.events();

    const { isTrusted, target, value } = events[
      events.length - 1
    ] as InputEvent;

    expect(isTrusted).toEqual(false);
    expect(target.node.attrs.id).toEqual("dropdown");
    expect(value).toEqual("2");
  });

  it("records type", async () => {
    const context = await launch({
      recordEvents: true,
      url: `${CONFIG.testUrl}login`
    });

    await context.type({ css: "#password" }, "secret");
    await context.type({ css: "#password" }, "↓Enter");

    await context.close();

    const events = await context.qawolf.events();

    expect(events[0].target.node.attrs.id).toEqual("password");
    // we will not receive any events for "secret" since it is all sendCharacter
    expect(
      (events.filter(e => isKeyEvent(e)) as KeyEvent[]).map(e => e.value)
    ).toEqual(["Enter"]);
  });

  it("records actions on another page", async () => {
    const context = await launch({ recordEvents: true });

    const page = await context.newPage();

    // wait for page to be decorated
    await sleep(500);

    await page.goto(`${CONFIG.testUrl}login`);
    await page.type("#password", "secret");

    await context.close();

    const events = await context.qawolf.events();
    expect(events.length).toBeGreaterThan(0);
  });
});
