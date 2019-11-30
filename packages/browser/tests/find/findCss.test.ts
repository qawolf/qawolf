import { CONFIG } from "@qawolf/config";
import { Page } from "puppeteer";
import { Browser } from "../../src/Browser";
import { findCss } from "../../src/find";
import { getXpath } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

describe("findCss", () => {
  it("finds an element with a css selector", async () => {
    const element = await findCss(page, "#password", {
      timeoutMs: 0
    });

    expect(await getXpath(element)).toEqual("//*[@id='password']");
  });
});
