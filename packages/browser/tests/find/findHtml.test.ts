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

  it("finds an element by data attribute", async () => {
    await page.evaluate(() =>
      document.getElementById("password")!.setAttribute("data-qa", "password")
    );

    const element = await findHtml(
      page,
      { html: '<button data-qa="password"></button>' },
      {
        dataAttribute: "data-qa",
        timeoutMs: 0
      }
    );
    expect(await getXpath(element)).toBe("//*[@id='password']");

    await page.evaluate(() =>
      document.getElementById("password")!.removeAttribute("data-qa")
    );
  });

  it("throws Element not found if the data-attribute is not found", async () => {
    let message = false;
    try {
      await findHtml(
        page,
        { html: '<input data-qa="password" name="password">' },
        {
          dataAttribute: "data-qa",
          timeoutMs: 0
        }
      );
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual("Element not found");
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
