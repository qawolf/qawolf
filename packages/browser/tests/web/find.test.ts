import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { Page } from "puppeteer";
import { Browser } from "../../src/Browser";
import { hasText } from "../../src/find";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

describe("findClickableAncestor", () => {
  it("chooses the top most clickable ancestor", async () => {
    const xpath = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const submitIcon = document.getElementsByTagName("i")[0]!;
      const ancestor = qawolf.find.findClickableAncestor(submitIcon, "data-qa");
      return qawolf.xpath.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='login']/button");
  });

  it("short-circuits on an element with the data attribute", async () => {
    const xpath = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const submitIcon = document.getElementsByTagName("i")[0]!;
      submitIcon.setAttribute("data-qa", "submit");

      const ancestor = qawolf.find.findClickableAncestor(submitIcon, "data-qa");
      submitIcon.removeAttribute("data-qa");

      return qawolf.xpath.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='login']/button/i");
  });
});

describe("hasText", () => {
  beforeAll(async () => {
    browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    page = await browser.currentPage();
  });

  afterAll(() => browser.close());

  it("returns true if page has text", async () => {
    const result = await hasText(page, "tomsmith");
    expect(result).toBe(true);
  });

  it("returns false if page does not have text", async () => {
    const result = await hasText(page, "janedoe", 250);
    expect(result).toBe(false);
  });

  it("returns false if timeout reached", async () => {
    const result = await hasText(page, "sup", 0);
    expect(result).toBe(false);
  });
});
