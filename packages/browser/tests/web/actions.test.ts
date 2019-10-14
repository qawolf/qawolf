import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { Browser } from "../../src/Browser";

let browser: Browser;

beforeAll(async () => {
  browser = await Browser.create();
});

afterAll(() => browser.close());

describe("scrollTo", () => {
  test("scrolls to a given position", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}large`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return Promise.resolve(qawolf.actions.scrollTo(1000));
    });

    const nextYPosition = await page.evaluate(() => window.pageYOffset);
    expect(nextYPosition).toBe(1000);

    await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return Promise.resolve(qawolf.actions.scrollTo(0));
    });

    const finalYPosition = await page.evaluate(() => window.pageYOffset);
    expect(finalYPosition).toBe(0);
  });

  test("scrolls in infinite scroll", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}infinite_scroll`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return Promise.resolve(qawolf.actions.scrollTo(2000));
    });

    const nextYPosition = await page.evaluate(() => window.pageYOffset);
    expect(nextYPosition).toBe(2000);
  });

  test("throws error if timeout", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}infinite_scroll`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    const testFn = async () =>
      await page.evaluate(() => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        return Promise.resolve(qawolf.actions.scrollTo(2000, 0));
      });

    await expect(testFn()).rejects.toThrowError();
  });
});
