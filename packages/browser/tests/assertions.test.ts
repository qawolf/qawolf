import { CONFIG } from "@qawolf/config";
import { Page } from "puppeteer";
import { hasText, getProperty } from "../src/assertions";
import { Browser } from "../src/Browser";

let browser: Browser;
let page: Page;

describe("hasText", () => {
  beforeAll(async () => {
    browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    page = await browser.currentPage();
  });

  afterAll(() => browser.close());

  it("returns true if page has text", async () => {
    const result = await hasText(page, "tomsmith");
    expect(result).toBe(true);
  });

  it("returns false if page does not have text", async () => {
    const result = await hasText(page, "janedoe", { timeoutMs: 250 });
    expect(result).toBe(false);
  });

  it("returns false if timeout reached", async () => {
    const result = await hasText(page, "tomsmith", { timeoutMs: -1 });
    expect(result).toBe(false);
  });
});

describe("getProperty", () => {
  beforeAll(async () => {
    browser = await Browser.create({ url: `${CONFIG.testUrl}dropdown` });
    page = await browser.currentPage();
  });

  afterAll(() => browser.close());

  it("returns element attribute if it exists", async () => {
    const id = await getProperty(page, { selector: "select", property: "id" });
    expect(id).toBe("dropdown");

    const tagName = await getProperty(page, {
      selector: "#dropdown",
      property: "tagName"
    });
    expect(tagName).toBe("SELECT");

    const value = await getProperty(page, {
      selector: "#dropdown",
      property: "value"
    });
    expect(value).toBe("");
  });

  it("returns undefined if element does not have property", async () => {
    const placeholder = await getProperty(page, {
      selector: "#dropdown",
      property: "placeholder"
    });
    expect(placeholder).toBeUndefined();
  });

  it("returns null if no elements match selector", async () => {
    const tagName = await getProperty(page, {
      selector: "#wrongId",
      property: "tagName"
    });
    expect(tagName).toBeNull();
  });

  it("returns null if multiple elements match selector", async () => {
    const id = await getProperty(page, { selector: "option", property: "id" });
    expect(id).toBeNull();
  });
});
