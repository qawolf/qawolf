import { CONFIG } from "@qawolf/config";
import { InputEvent, ScrollEvent } from "@qawolf/types";
import { sleep } from "@qawolf/web";
import { click, input, scroll } from "../../src/actions";
import { Browser } from "../../src/Browser";

describe("Recorder", () => {
  it("records click on a link", async () => {
    const browser = await Browser.create({ record: true, url: CONFIG.testUrl });
    const element = await browser.element({
      action: "click",
      index: 0,
      target: {
        textContent: "broken images",
        xpath: '//*[@id="content"]/ul/li[3]/a'
      }
    });
    await click(element);

    const page = await browser.currentPage();

    // close the browser to ensure events are transmitted
    await browser.close();

    const events = page.qawolf.events.filter(e => e.isTrusted);
    expect(events.length).toEqual(1);
    expect(events[0].action).toEqual("click");
    expect(events[0].target.xpath).toEqual("//*[@id='content']/ul/li[3]/a");
  });

  it("records input", async () => {
    const browser = await Browser.create({
      record: true,
      url: `${CONFIG.testUrl}login`
    });

    const element = await browser.element({
      action: "input",
      index: 0,
      target: { id: "password", xpath: "//*[@id='password']" }
    });
    await input(element, "secret");

    const page = await browser.currentPage();

    // close the browser to ensure events are transmitted
    await browser.close();

    const events = page.qawolf.events.filter(e => e.isTrusted);
    const lastEvent = events[events.length - 1] as InputEvent;
    expect(lastEvent.target.xpath).toEqual("//*[@id='password']");
    expect(lastEvent.value).toEqual("secret");
  });

  it("records select option", async () => {
    const browser = await Browser.create({
      record: true,
      url: `${CONFIG.testUrl}dropdown`
    });

    const element = await browser.element({
      action: "input",
      index: 0,
      target: { id: "dropdown", tagName: "select" }
    });
    await input(element, "2");

    const page = await browser.currentPage();

    // close the browser to ensure events are transmitted
    await browser.close();

    const events = page.qawolf.events;
    const lastEvent = events[events.length - 1] as InputEvent;
    expect(lastEvent.isTrusted).toEqual(false);
    expect(lastEvent.target.xpath).toEqual("//*[@id='dropdown']");
    expect(lastEvent.value).toEqual("2");
  });

  it("records scroll", async () => {
    const browser = await Browser.create({
      record: true,
      url: `${CONFIG.testUrl}large`
    });

    const page = await browser.currentPage();
    await scroll(page, 1000);

    // give time for the scroll event to trigger
    await sleep(100);

    // close the browser to ensure events are transmitted
    await browser.close();

    const events = page.qawolf.events;
    const lastEvent = events[events.length - 1] as ScrollEvent;
    expect(lastEvent).toMatchObject({
      action: "scroll",
      isTrusted: true,
      target: { xpath: "/html" },
      value: { x: 0, y: 1000 }
    });
  });
});
