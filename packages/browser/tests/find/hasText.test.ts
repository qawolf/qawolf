import { CONFIG } from "@qawolf/config";
import { Browser, launch, Page } from "../../src";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch({ url: `${CONFIG.testUrl}login` });
  page = await browser.page();
});

afterAll(() => browser.close());

describe("Browser.hasText", () => {
  it("returns false if page does not have text", async () => {
    const result = await browser.hasText("janedoe", { timeoutMs: 0 });
    expect(result).toBe(false);
  });
});

describe("Page.hasText", () => {
  it("returns true if page has text", async () => {
    const result = await page.qawolf.hasText("tomsmith");
    expect(result).toBe(true);
  });
});
