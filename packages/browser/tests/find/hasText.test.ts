import { CONFIG } from "@qawolf/config";
import { BrowserContext, launch, Page } from "../../src";

let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  context = await launch({ url: `${CONFIG.testUrl}login` });
  page = await context.page();
});

afterAll(() => context.close());

describe("BrowserContext.hasText", () => {
  it("returns false if page does not have text", async () => {
    const result = await context.hasText("janedoe", { timeoutMs: 0 });
    expect(result).toBe(false);
  });
});

describe("Page.hasText", () => {
  it("returns true if page has text", async () => {
    const result = await page.qawolf.hasText("tomsmith", { timeoutMs: 0 });
    expect(result).toBe(true);
  });

  it("is case sensitive", async () => {
    const result = await page.qawolf.hasText("Tomsmith", { timeoutMs: 0 });
    expect(result).toBe(false);
  });
});
