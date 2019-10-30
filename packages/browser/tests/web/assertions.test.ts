import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { Page } from "puppeteer";
import { Browser } from "../../src/Browser";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

describe("hasText", () => {
  it("returns true if page has text", async () => {
    const hasText = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.assertions.hasText("tomsmith", { timeoutMs: 5000 });
    });

    expect(hasText).toBe(true);
  });

  it("returns false if page does not have text", async () => {
    const hasText = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.assertions.hasText("janedoe", { timeoutMs: 5000 });
    });

    expect(hasText).toBe(false);
  });

  it("returns false if timeout reached", async () => {
    const hasText = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.assertions.hasText("tomsmith", { timeoutMs: 0 });
    });

    expect(hasText).toBe(false);
  });
});
