import { CONFIG } from "@qawolf/config";
import { BrowserContext, launch, Page } from "../../src";

let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  context = await launch({ url: `${CONFIG.sandboxUrl}checkbox-inputs` });
  page = await context.page();
});

afterAll(() => context.close());

describe("BrowserContext.findProperty", () => {
  it("returns element attribute if it exists", async () => {
    const id = await context.findProperty({ css: "#single" }, "id", {
      timeoutMs: 2000
    });
    expect(id).toBe("single");

    const tagName = await context.findProperty({ css: "#single" }, "tagName", {
      timeoutMs: 2000
    });
    expect(tagName).toBe("INPUT");

    const value = await context.findProperty({ css: "#single" }, "checked", {
      timeoutMs: 2000
    });
    expect(value).toBe(false);
  });
});

describe("Page.findProperty", () => {
  it("returns undefined if element does not have property", async () => {
    const href = await page.qawolf().findProperty({ css: "#single" }, "href");
    expect(href).toBeUndefined();
  });

  it("throws an error if no elements match selector", async () => {
    let message = false;

    try {
      await page.qawolf().findProperty({ css: "#wrongId" }, "tagName", {
        timeoutMs: 0
      });
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual("Element not found");
  });

  it("returns the first element's property if multiple match selector", async () => {
    const id = await page.qawolf().findProperty({ css: "input" }, "id");
    expect(id).toBe("single");
  });
});
