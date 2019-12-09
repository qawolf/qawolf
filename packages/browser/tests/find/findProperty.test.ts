import { CONFIG } from "@qawolf/config";
import { Browser, launch, Page } from "../../src";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch({ url: `${CONFIG.testUrl}dropdown` });
  page = await browser.page();
});

afterAll(() => browser.close());

describe("Browser.findProperty", () => {
  it("returns element attribute if it exists", async () => {
    const id = await browser.findProperty({ css: "select" }, "id");
    expect(id).toBe("dropdown");

    const tagName = await browser.findProperty({ css: "#dropdown" }, "tagName");
    expect(tagName).toBe("SELECT");

    const value = await browser.findProperty({ css: "#dropdown" }, "value");
    expect(value).toBe("");
  });
});

describe("Page.findProperty", () => {
  it("returns undefined if element does not have property", async () => {
    const placeholder = await page.qawolf.findProperty(
      { css: "#dropdown" },
      "placeholder"
    );
    expect(placeholder).toBeUndefined();
  });

  it("returns null if no elements match selector", async () => {
    const tagName = await page.qawolf.findProperty(
      { css: "#wrongId" },
      "tagName",
      {
        timeoutMs: 0
      }
    );
    expect(tagName).toBeNull();
  });

  it("returns the first element's property if multiple match selector", async () => {
    const id = await page.qawolf.findProperty({ css: "option" }, "selected");
    expect(id).toEqual(true);
  });
});
