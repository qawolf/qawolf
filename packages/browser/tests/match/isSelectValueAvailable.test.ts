import { Page } from "puppeteer";
import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { Browser } from "../../src/Browser";

describe("isSelectValueAvailable", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await Browser.create({ url: `${CONFIG.testUrl}dropdown` });
    page = await browser.currentPage();
  });

  afterAll(() => browser.close());

  test("returns true if value not specified", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const dropdown = document.getElementById("dropdown")!;

      return qawolf.match.isSelectValueAvailable(dropdown);
    });

    expect(isAvailable).toBe(true);
  });

  test("returns true if element not select", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const h3 = document.getElementsByTagName("h3")[0]!;

      return qawolf.match.isSelectValueAvailable(h3, "2");
    });

    expect(isAvailable).toBe(true);
  });

  test("returns true if specified value is option in select", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const dropdown = document.getElementById("dropdown")!;

      return qawolf.match.isSelectValueAvailable(dropdown, "2");
    });

    expect(isAvailable).toBe(true);
  });

  test("returns false if specified value is not option in select", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const dropdown = document.getElementById("dropdown")!;

      return qawolf.match.isSelectValueAvailable(dropdown, "11");
    });

    expect(isAvailable).toBe(false);
  });
});
