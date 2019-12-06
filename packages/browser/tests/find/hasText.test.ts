import { CONFIG } from "@qawolf/config";
import { Page } from "puppeteer";
import { Browser, hasText, launch } from "../../src";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch({ url: `${CONFIG.testUrl}login` });
  page = await browser.page();
});

afterAll(() => browser.close());

describe("hasText", () => {
  it("returns true if page has text", async () => {
    const result = await hasText(page, "tomsmith");
    expect(result).toBe(true);
  });

  it("returns false if page does not have text", async () => {
    const result = await hasText(page, "janedoe", 250);
    expect(result).toBe(false);
  });

  it("returns false if timeout reached", async () => {
    const result = await hasText(page, "sup", 0);
    expect(result).toBe(false);
  });
});
