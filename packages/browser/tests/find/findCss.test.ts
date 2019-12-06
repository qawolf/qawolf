import { CONFIG } from "@qawolf/config";
import { Browser, launch, Page } from "../../src";
import { findCss } from "../../src/find/findCss";
import { getXpath } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch({ url: `${CONFIG.testUrl}login` });
  page = await browser.page();
});

afterAll(() => browser.close());

describe("findCss", () => {
  it("finds an element with a css selector", async () => {
    const element = await findCss(
      page,
      { css: "#password" },
      {
        timeoutMs: 0
      }
    );

    expect(await getXpath(element)).toEqual("//*[@id='password']");
  });
});
