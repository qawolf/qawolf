import { CONFIG } from "@qawolf/config";
import { Browser, launch, Page } from "../../src";
import { findText } from "../../src/find/findText";
import { getXpath } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch({ url: CONFIG.testUrl });
  page = await browser.page();
});

afterAll(() => browser.close());

describe("findText", () => {
  it("finds an element by text", async () => {
    const element = await findText(page, { text: "form authentication" });

    expect(await getXpath(element)).toEqual("//*[@id='content']/ul/li[18]");
  });
});
