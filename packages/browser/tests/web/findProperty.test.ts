import { CONFIG } from "@qawolf/config";
import { Page } from "puppeteer";
import { Browser } from "../../src/Browser";
import { findProperty } from "../../src/find";

let browser: Browser;
let page: Page;

describe("findProperty", () => {
  beforeAll(async () => {
    browser = await Browser.create({ url: `${CONFIG.testUrl}dropdown` });
    page = await browser.currentPage();
  });

  afterAll(() => browser.close());

  it("returns element attribute if it exists", async () => {
    const id = await findProperty(page, { selector: "select", property: "id" });
    expect(id).toBe("dropdown");

    const tagName = await findProperty(page, {
      selector: "#dropdown",
      property: "tagName"
    });
    expect(tagName).toBe("SELECT");

    const value = await findProperty(page, {
      selector: "#dropdown",
      property: "value"
    });
    expect(value).toBe("");
  });

  it("returns undefined if element does not have property", async () => {
    const placeholder = await findProperty(page, {
      selector: "#dropdown",
      property: "placeholder"
    });
    expect(placeholder).toBeUndefined();
  });

  it("returns null if no elements match selector", async () => {
    const tagName = await findProperty(page, {
      selector: "#wrongId",
      property: "tagName"
    });
    expect(tagName).toBeNull();
  });

  it("returns null if multiple elements match selector", async () => {
    const id = await findProperty(page, { selector: "option", property: "id" });
    expect(id).toBeNull();
  });
});
