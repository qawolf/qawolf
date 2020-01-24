import { launch } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { InputEvent, KeyEvent, PasteEvent, ScrollEvent } from "@qawolf/types";
import { isKeyEvent, sleep } from "@qawolf/web";

describe("Recorder", () => {
  it("records click on a link", async () => {
    const browser = await launch({
      recordEvents: true,
      url: CONFIG.testUrl
    });
    await browser.click({ html: "<a>broken images</a>" }, { simulate: false });

    // close the browser to ensure events are transmitted
    await sleep(1000);
    await browser.close();

    const events = browser.qawolf.events.filter(e => e.isTrusted);
    expect(events.length).toEqual(1);
    expect(events[0].name).toEqual("click");
    expect(events[0].target.node.attrs.href).toEqual("/broken_images");
  });

  it("records paste", async () => {
    const browser = await launch({
      recordEvents: true,
      url: `${CONFIG.testUrl}login`
    });

    const page = await browser.page();

    // tried a lot of ways to test this
    // sending Meta+V did not work
    // robotjs was not able to install for node v12
    // so we simulate a paste event instead
    await page.evaluate(() => {
      const event = new Event("paste") as any;
      event.clipboardData = { getData: () => "secret" };
      document.querySelector("#password")!.dispatchEvent(event);
    });

    // close the browser to ensure events are transmitted
    await sleep(1000);
    await browser.close();

    const events = page.qawolf.events;
    expect(events[0].target.node.attrs.id).toEqual("password");
    expect((events[0] as PasteEvent).value).toEqual("secret");
  });

  it("records scroll", async () => {
    const browser = await launch({
      recordEvents: true,
      url: `${CONFIG.testUrl}large`
    });

    const page = await browser.page();

    // from https://github.com/GoogleChrome/playwright/issues/4119#issue-417279184
    await (page as any)._client.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      deltaX: 0,
      deltaY: 500,
      x: 0,
      y: 0
    });

    // give enough time for scroll event to fire on CI browser
    await sleep(2000);

    // close the browser to ensure events are transmitted
    await browser.close();

    const events = page.qawolf.events;

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
    const browser = await launch({
      recordEvents: true,
      url: `${CONFIG.testUrl}dropdown`
    });
    await browser.select({ css: "#dropdown" }, "2");

    const page = await browser.page();

    // close the browser to ensure events are transmitted
    await sleep(1000);
    await browser.close();

    const events = page.qawolf.events;

    const { isTrusted, target, value } = events[
      events.length - 1
    ] as InputEvent;

    expect(isTrusted).toEqual(false);
    expect(target.node.attrs.id).toEqual("dropdown");
    expect(value).toEqual("2");
  });

  it("records type", async () => {
    const browser = await launch({
      recordEvents: true,
      url: `${CONFIG.testUrl}login`
    });

    const page = await browser.page();

    await browser.type({ css: "#password" }, "secret");
    await browser.type({ css: "#password" }, "↓Enter");

    // close the browser to ensure events are transmitted
    await sleep(1000);
    await browser.close();

    const events = page.qawolf.events.filter(e => e.isTrusted);

    expect(events[0].target.node.attrs.id).toEqual("password");
    // we will not receive any events for "secret" since it is all sendCharacter
    expect(
      (events.filter(e => isKeyEvent(e)) as KeyEvent[]).map(e => e.value)
    ).toEqual(["Enter"]);
  });
});
