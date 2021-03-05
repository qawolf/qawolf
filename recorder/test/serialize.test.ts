import { Browser, Page } from "playwright";
import { QAWolfWeb } from "../src";
import { launch } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  const launched = await launch();
  browser = launched.browser;
  page = launched.page;
});

afterAll(() => browser.close());

describe("nodeToDoc", () => {
  it("serializes tag name and attributes", async () => {
    await page.setContent(
      `<html><body><img alt="spirit" src="logo192.png"></body></html>`
    );

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
