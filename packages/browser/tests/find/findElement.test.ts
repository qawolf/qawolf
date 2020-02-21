import { CONFIG } from "@qawolf/config";
import { BrowserContext, launch, Page } from "../../src";
import { findElement } from "../../src/find/findElement";
import { getXpath } from "./utils";

let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  context = await launch({
    url: `${CONFIG.sandboxUrl}checkbox-inputs`
  });
  page = await context.page();
});

afterAll(() => context.close());

describe("findCss", () => {
  it("finds an element with a css selector", async () => {
    const element = await findElement(
      page,
      { css: "#another" },
      {
        timeoutMs: 0
      }
    );

    expect(await getXpath(element)).toEqual("//*[@id='another']");
  });
});

describe("findHtml", () => {
  it("finds an element by a strong key (id)", async () => {
    const element = await findElement(
      page,
      { html: '<input id="another" >' },
      {
        timeoutMs: 0
      }
    );

    expect(await getXpath(element)).toEqual("//*[@id='another']");
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
      { text: "Native HTML" },
      { timeoutMs: 0 }
    );
    expect(await getXpath(element)).toEqual("//*[@id='root']/div/div[1]/h3");
  });

  it("finds the deepest element", async () => {
    let element = await findElement(
      page,
      { text: "Single checkbox" },
      { timeoutMs: 0 }
    );
    expect(await getXpath(element)).toEqual(
      "//*[@id='root']/div/div[1]/label[1]"
    );
  });

  it("skips elements with incorrect case", async () => {
    let message = false;

    try {
      await findElement(page, { text: "native HTML" }, { timeoutMs: 0 });
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual("Element not found");
  });
});
