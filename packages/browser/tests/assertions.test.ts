import { CONFIG } from "@qawolf/config";
import { Page } from "puppeteer";
import { hasText } from "../src/assertions";
import { Browser } from "../src/Browser";

let browser: Browser;
let page: Page;

beforeEach(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterEach(() => browser.close());

describe("hasText", () => {
  it("returns true if page has text", async () => {
    const result = await hasText(page, "tomsmith");

    expect(result).toBe(true);
  });

  it("returns false if page does not have text", async () => {
    const result = await hasText(page, "janedoe", { timeoutMs: 2000 });

    expect(result).toBe(false);
  });

  it("returns false if timeout reached", async () => {
    const result = await hasText(page, "tomsmith", { timeoutMs: -1 });

    expect(result).toBe(false);
  });
});
