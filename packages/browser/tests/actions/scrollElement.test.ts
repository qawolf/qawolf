import { CONFIG } from "@qawolf/config";
import { Browser } from "../../src/Browser";
import { scrollElement } from "../../src/actions";

describe("scrollElement", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await Browser.create();
  });

  afterAll(() => browser.close());

  it("scrolls to a given position", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}large`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    const element = await browser.element({
      action: "scroll",
      index: 0,
      target: { xpath: "/html" }
    });
    await scrollElement(element, { x: 0, y: 1000 });

    const nextYPosition = await page.evaluate(() => window.pageYOffset);
    expect(nextYPosition).toBe(1000);

    await scrollElement(element, { x: 0, y: 0 });

    const finalYPosition = await page.evaluate(() => window.pageYOffset);
    expect(finalYPosition).toBe(0);
  });

  it("scrolls in infinite scroll", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}infinite_scroll`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    const element = await browser.element({
      action: "scroll",
      index: 0,
      target: { xpath: "/html" }
    });
    await scrollElement(element, { x: 0, y: 2000 });

    const nextYPosition = await page.evaluate(() => window.pageYOffset);
    expect(nextYPosition).toBe(2000);
  });

  it("throws error if timeout", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}infinite_scroll`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    const element = await browser.element({
      action: "scroll",
      index: 0,
      target: { xpath: "/html" }
    });

    const testFn = async () =>
      await scrollElement(element, { x: 0, y: 2000 }, 0);
    await expect(testFn()).rejects.toThrowError();
  });
});
