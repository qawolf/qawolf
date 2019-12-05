import { Browser, Page } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";

describe("isSelectValueAvailable", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await Browser.create({ url: `${CONFIG.testUrl}dropdown` });
    page = await browser.currentPage();
  });

  afterAll(() => browser.close());

  it("returns true if value not specified", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const dropdown = document.getElementById("dropdown")!;

      return qawolf.select.isSelectValueAvailable(dropdown);
    });

    expect(isAvailable).toBe(true);
  });

  it("returns true if element not select", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const h3 = document.getElementsByTagName("h3")[0]!;

      return qawolf.select.isSelectValueAvailable(h3, "2");
    });

    expect(isAvailable).toBe(true);
  });

  it("returns true if specified value is option in select", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const dropdown = document.getElementById("dropdown")!;

      return qawolf.select.isSelectValueAvailable(dropdown, "2");
    });

    expect(isAvailable).toBe(true);
  });

  it("returns false if specified value is not option in select", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const dropdown = document.getElementById("dropdown")!;

      return qawolf.select.isSelectValueAvailable(dropdown, "11");
    });

    expect(isAvailable).toBe(false);
  });
});
