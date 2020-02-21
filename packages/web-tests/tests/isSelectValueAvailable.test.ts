import { BrowserContext, launch, Page } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";

describe("isSelectValueAvailable", () => {
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    context = await launch({ url: `${CONFIG.sandboxUrl}selects` });
    page = await context.page();
  });

  afterAll(() => context.close());

  it("returns true if value not specified", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const dropdown = document.querySelector(
        "[data-qa='html-select']"
      ) as HTMLSelectElement;

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
      const dropdown = document.querySelector(
        "[data-qa='html-select']"
      ) as HTMLSelectElement;

      return qawolf.select.isSelectValueAvailable(dropdown, "cat");
    });

    expect(isAvailable).toBe(true);
  });

  it("returns false if specified value is not option in select", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const dropdown = document.querySelector(
        "[data-qa='html-select']"
      ) as HTMLSelectElement;

      return qawolf.select.isSelectValueAvailable(dropdown, "horse");
    });

    expect(isAvailable).toBe(false);
  });
});
