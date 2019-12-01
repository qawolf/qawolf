import { CONFIG } from "@qawolf/config";
import { Page } from "puppeteer";
import { Browser } from "../../src/Browser";
import { findHtml } from "../../src/find";
import { getXpath } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

describe("findHtml", () => {
  it("finds an element by a strong key (name)", async () => {
    const element = await findHtml(page, '<input name="password" />', {
      timeoutMs: 0
    });

    expect(await getXpath(element)).toEqual("//*[@id='password']");
  });

  it("finds an element by data attribute", async () => {
    await page.evaluate(() =>
      document.getElementById("password")!.setAttribute("data-qa", "password")
    );

    const element = await findHtml(
      page,
      '<button data-qa="password"></button>',
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

  it("returns null if the data-attribute is not found", async () => {
    const element = await findHtml(
      page,
      '<input data-qa="password" name="password">',
      {
        dataAttribute: "data-qa",
        timeoutMs: 0
      }
    );
    expect(element).toBe(null);
  });

  it("finds html and body elements", async () => {
    let element = await findHtml(page, "<html />", {
      timeoutMs: 0
    });
    expect(await getXpath(element)).toEqual("/html");

    element = await findHtml(page, "<body />", {
      timeoutMs: 0
    });
    expect(await getXpath(element)).toEqual("/html/body");
  });
});
