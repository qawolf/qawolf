import { CONFIG } from "@qawolf/config";
import { BrowserContext, launch } from "../../src";
import { scrollElement } from "../../src/actions";

let context: BrowserContext;

beforeAll(async () => {
  context = await launch();
});

afterAll(() => context.close());

describe("BrowserContext.scroll", () => {
  it("scrolls in infinite scroll", async () => {
    const page = await context.goto(`${CONFIG.testUrl}infinite_scroll`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    await page.qawolf.scroll({ css: "html" }, { x: 0, y: 2000 });

    const nextYPosition = await page.evaluate(() => window.pageYOffset);
    expect(nextYPosition).toBe(2000);
  });
});

describe("Page.scroll", () => {
  it("scrolls to a given position", async () => {
    const page = await context.goto(`${CONFIG.testUrl}large`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    await page.qawolf.scroll({ html: "<html></html>" }, { x: 0, y: 1000 });

    const nextYPosition = await page.evaluate(() => window.pageYOffset);
    expect(nextYPosition).toBe(1000);

    await page.qawolf.scroll({ css: "html" }, { x: 0, y: 0 });

    const finalYPosition = await page.evaluate(() => window.pageYOffset);
    expect(finalYPosition).toBe(0);
  });
});

describe("scrollElement", () => {
  it("throws error if timeout and not able to scroll", async () => {
    const page = await context.goto(`${CONFIG.testUrl}infinite_scroll`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    await page.evaluate(() => {
      // prevent scrolling
      const html = document.getElementsByTagName("html")[0];
      (html as any)._scroll = html.scroll;
      html.scroll = () => {};
    });

    const element = await context.find({ css: "html" });

    const testFn = async () =>
      await scrollElement(element, { x: 0, y: 2000 }, { timeoutMs: 0 });

    await expect(testFn()).rejects.toThrowError();

    await page.evaluate(() => {
      // restore scrolling
      const html = document.getElementsByTagName("html")[0];
      html.scroll = (html as any)._scroll;
    });
  });
});
