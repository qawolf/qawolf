import { CONFIG } from "@qawolf/config";
import { Page } from "puppeteer";
import { Browser } from "../../src/Browser";
import { findText } from "../../src/find";
import { getXpath } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: CONFIG.testUrl });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

describe("findText", () => {
  it("finds an element by text", async () => {
    const element = await findText(page, "form authentication", {
      timeoutMs: 0
    });

    expect(await getXpath(element)).toEqual("//*[@id='content']/ul/li[18]");
  });
});
