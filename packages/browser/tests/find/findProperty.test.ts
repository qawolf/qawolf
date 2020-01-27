import { CONFIG } from "@qawolf/config";
import { BrowserContext, launch, Page } from "../../src";

let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  context = await launch({ url: `${CONFIG.testUrl}dropdown` });
  page = await context.page();
});

afterAll(() => context.close());

describe("BrowserContext.findProperty", () => {
  it("returns element attribute if it exists", async () => {
    const id = await context.findProperty({ css: "select" }, "id");
    expect(id).toBe("dropdown");

    const tagName = await context.findProperty({ css: "#dropdown" }, "tagName");
    expect(tagName).toBe("SELECT");

    const value = await context.findProperty({ css: "#dropdown" }, "value");
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

  it("throws an error if no elements match selector", async () => {
    let message = false;

    try {
      await page.qawolf.findProperty({ css: "#wrongId" }, "tagName", {
        timeoutMs: 0
      });
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual("Element not found");
  });

  it("returns the first element's property if multiple match selector", async () => {
    const id = await page.qawolf.findProperty({ css: "option" }, "selected");
    expect(id).toEqual(true);
  });
});
