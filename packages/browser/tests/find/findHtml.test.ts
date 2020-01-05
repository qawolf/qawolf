import { CONFIG } from "@qawolf/config";
import { Browser, launch, Page } from "../../src";
import { findHtml } from "../../src/find/findHtml";
import { getXpath } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch({ url: `${CONFIG.testUrl}login` });
  page = await browser.page();
});

afterAll(() => browser.close());

describe("findHtml", () => {
  it("finds an element by a strong key (name)", async () => {
    const element = await findHtml(
      page,
      { html: '<input name="password" />' },
      {
        timeoutMs: 0
      }
    );

    expect(await getXpath(element)).toEqual("//*[@id='password']");
  });

  it("finds html and body elements", async () => {
    // Use action "type" to make sure findHtml skips
    // queryActionElements for body and html
    let element = await findHtml(
      page,
      { html: "<body />" },
      {
        action: "type",
        timeoutMs: 0
      }
    );
    expect(await getXpath(element)).toEqual("/html/body");

    element = await findHtml(
      page,
      { html: "<html />" },
      {
        action: "type",
        timeoutMs: 0
      }
    );
    expect(await getXpath(element)).toEqual("/html");
  });
});
