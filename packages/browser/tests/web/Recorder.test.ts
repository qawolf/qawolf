import { CONFIG } from "@qawolf/config";
import { InputEvent, KeyEvent, PasteEvent, ScrollEvent } from "@qawolf/types";
import { isKeyEvent, sleep } from "@qawolf/web";
import { click, focusClear, select, type } from "../../src/actions";
import { Browser } from "../../src/Browser";

describe("Recorder", () => {
  it("records click on a link", async () => {
    const browser = await Browser.create({
      recordEvents: true,
      url: CONFIG.testUrl
    });
    const element = await browser.element({
      action: "click",
      index: 0,
      target: {
        innerText: "broken images",
        xpath: '//*[@id="content"]/ul/li[3]/a'
      }
    });
    await click(element);

    const page = await browser.currentPage();

    // close the browser to ensure events are transmitted
    await browser.close();

    const events = page.qawolf.events.filter(e => e.isTrusted);
    expect(events.length).toEqual(1);
    expect(events[0].name).toEqual("click");
    expect(events[0].target.xpath).toEqual("//*[@id='content']/ul/li[3]/a");
  });

  it("records paste", async () => {
    const browser = await Browser.create({
      recordEvents: true,
      url: `${CONFIG.testUrl}login`
    });

    const element = await browser.element({
      action: "type",
      index: 0,
      target: { id: "password", xpath: "//*[@id='password']" }
    });

    const page = await browser.currentPage();
    await focusClear(element);

    // tried a lot of ways to test this
    // sending Meta+V did not work
    // robotjs was not able to install for node v12
    // so we simulate a paste event instead
    await page.evaluate(() => {
      const event = new Event("paste") as any;
      event.clipboardData = { getData: () => "secret" };
      document.activeElement!.dispatchEvent(event);
    });

    // close the browser to ensure events are transmitted
    await browser.close();

    const events = page.qawolf.events;
    expect(events[0].target.xpath).toEqual("//*[@id='password']");
    expect((events[0] as PasteEvent).value).toEqual("secret");
  });

  it("records scroll", async () => {
    const browser = await Browser.create({
      recordEvents: true,
      url: `${CONFIG.testUrl}large`
    });

    const page = await browser.currentPage();

    // from https://github.com/GoogleChrome/puppeteer/issues/4119#issue-417279184
    await (page as any)._client.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      deltaX: 0,
      deltaY: 1000,
      x: 0,
      y: 0
    });

    // give enough time for scroll event to fire on CI browser
    await sleep(1000);

    // close the browser to ensure events are transmitted
    await browser.close();

    const events = page.qawolf.events;

    const { isTrusted, name, target, value } = events[
      events.length - 1
    ] as ScrollEvent;

    expect(name).toEqual("scroll");
    expect(target.xpath).toEqual("/html");
    expect(value).toMatchObject({ x: 0, y: 1000 });
    expect(isTrusted).toEqual(true);
  });

  it("records select option", async () => {
    const browser = await Browser.create({
      recordEvents: true,
      url: `${CONFIG.testUrl}dropdown`
    });
    const page = await browser.currentPage();

    const element = await browser.element({
      action: "type",
      index: 0,
      target: { id: "dropdown", tagName: "select" }
    });

    await select(element, "2");

    // close the browser to ensure events are transmitted
    await browser.close();

    const events = page.qawolf.events;

    const { isTrusted, target, value } = events[
      events.length - 1
    ] as InputEvent;

    expect(isTrusted).toEqual(false);
    expect(target.xpath).toEqual("//*[@id='dropdown']");
    expect(value).toEqual("2");
  });

  it("records type", async () => {
    const browser = await Browser.create({
      recordEvents: true,
      url: `${CONFIG.testUrl}login`
    });

    const element = await browser.element({
      action: "type",
      index: 0,
      target: { id: "password", xpath: "//*[@id='password']" }
    });

    const page = await browser.currentPage();

    await focusClear(element);
    await type(page, "secret");
    await type(page, "↓Enter↑Enter→嗨");

    // close the browser to ensure events are transmitted
    await browser.close();

    const events = page.qawolf.events.filter(e => e.isTrusted);

    expect(events[0].target.xpath).toEqual("//*[@id='password']");
    expect(
      (events.filter(e => isKeyEvent(e)) as KeyEvent[]).map(e => e.value)
    ).toEqual([
      "s",
      "s",
      "e",
      "e",
      "c",
      "c",
      "r",
      "r",
      "e",
      "e",
      "t",
      "t",
      "Enter",
      "Enter"
    ]);
  });
});
