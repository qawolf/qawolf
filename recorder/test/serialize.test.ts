import { Browser, Page } from "playwright";
import { QAWolfWeb } from "../src";
import { launch, TEST_URL } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch();
  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto(`${TEST_URL}login`);
});

afterAll(() => browser.close());

describe("nodeToDoc", () => {
  it("serializes tag name and attributes", async () => {
    await page.goto(`${TEST_URL}images`);

    const doc = await page.evaluate(() => {
      const web: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector("img");
      if (!element) throw new Error("element not found");
      return web.nodeToDoc(element);
    });

    expect(doc).toEqual({
      attrs: {
        alt: "spirit",
        src: "logo192.png",
      },
      name: "img",
    });
  });
});
