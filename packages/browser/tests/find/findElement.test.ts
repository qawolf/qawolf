import { CONFIG } from "@qawolf/config";
import { BrowserContext, launch, Page } from "../../src";
import { findElement } from "../../src/find/findElement";
import { getXpath } from "./utils";

let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  context = await launch({
    url: `${CONFIG.testUrl}checkboxes`
  });
  page = await context.page();
});

afterAll(() => context.close());

describe("findCss", () => {
  it("finds an element with a css selector", async () => {
    const element = await findElement(
      page,
      { css: "#checkboxes" },
      {
        timeoutMs: 0
      }
    );

    expect(await getXpath(element)).toEqual("//*[@id='checkboxes']");
  });
});

describe("findHtml", () => {
  it("finds an element by a strong key (alt)", async () => {
    const element = await findElement(
      page,
      { html: '<img alt="Fork me on GitHub" >' },
      {
        timeoutMs: 0
      }
    );

    expect(await getXpath(element)).toEqual("/html/body/div[2]/a/img");
  });

  it("finds html and body elements", async () => {
    // Use action "type" to make sure findElement skips
    // queryActionElements for body and html
    let element = await findElement(
      page,
      { html: "<body />" },
      {
        action: "type",
        timeoutMs: 0
      }
    );
    expect(await getXpath(element)).toEqual("/html/body");

    element = await findElement(
      page,
      { html: "<html />" },
      {
        action: "type",
        timeoutMs: 0
      }
    );
    expect(await getXpath(element)).toEqual("/html");
  });
});

describe("findText", () => {
  it("finds the element with the least extra text", async () => {
    let element = await findElement(
      page,
      { text: "Checkbox" },
      { timeoutMs: 0 }
    );
    expect(await getXpath(element)).toEqual("//*[@id='content']/div/h3");

    element = await findElement(page, { text: "checkbox 1" }, { timeoutMs: 0 });
    expect(await getXpath(element)).toEqual("//*[@id='checkboxes']");
  });

  it("finds the deepest element", async () => {
    let element = await findElement(
      page,
      { text: "checkbox 1" },
      { timeoutMs: 0 }
    );
    expect(await getXpath(element)).toEqual("//*[@id='checkboxes']");
  });

  it("skips elements with incorrect case", async () => {
    let message = false;

    try {
      await findElement(page, { text: "checkboxes" }, { timeoutMs: 0 });
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual("Element not found");
  });
});
