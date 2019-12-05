import { Browser, PuppeteerPage } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";

let browser: Browser;
let page: PuppeteerPage;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

describe("queryActionElements", () => {
  it("returns all elements for click action", async () => {
    const actionElementCount = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const actionElements = qawolf.find.queryActionElements("click");

      return actionElements.length;
    });

    expect(actionElementCount).toBe(28);
  });

  it("returns only input elements for input action", async () => {
    const actionElements = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const actionElements = qawolf.find.queryActionElements("type");

      return actionElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
    });

    expect(actionElements).toEqual([
      "//*[@id='username']",
      "//*[@id='password']"
    ]);
  });

  it("does not include elements that are not visible", async () => {
    const actionElementXpaths = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.style.border = "0";
      username.style.padding = "0";
      username.style.width = "0";

      const actionElements = qawolf.find.queryActionElements("type");

      return actionElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
    });

    expect(actionElementXpaths).toEqual(["//*[@id='password']"]);

    await browser.goto(`${CONFIG.testUrl}login`); // reset styles
  });
});

describe("queryDataElements", () => {
  it("returns all elements with given data value for click action", async () => {
    const dataElementXpaths = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const submit = document.getElementsByTagName("button")[0]!;
      submit.setAttribute("data-qa", "submit");

      const dataElements = qawolf.find.queryDataElements({
        action: "click",
        dataAttribute: "data-qa",
        dataValue: "submit"
      });
      submit.removeAttribute("data-qa");

      return dataElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
    });

    expect(dataElementXpaths).toEqual(["//*[@id='login']/button"]);
  });

  it("returns only input elements with given data value for input action", async () => {
    const dataElementXpaths = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      const submit = document.getElementsByTagName("button")[0]!;
      username.setAttribute("data-qa", "username");
      submit.setAttribute("data-qa", "username");

      const dataElements = qawolf.find.queryDataElements({
        action: "type",
        dataAttribute: "data-qa",
        dataValue: "username"
      });

      username.removeAttribute("data-qa");
      submit.removeAttribute("data-qa");

      return dataElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
    });

    expect(dataElementXpaths).toEqual(["//*[@id='username']"]);
  });

  it("does not include elements that are not visible", async () => {
    const dataElementXpaths = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      const password = document.getElementById("password")!;

      username.style.border = "0";
      username.style.padding = "0";
      username.style.width = "0";

      username.setAttribute("data-qa", "username");
      password.setAttribute("data-qa", "username");

      const dataElements = qawolf.find.queryDataElements({
        action: "type",
        dataAttribute: "data-qa",
        dataValue: "username"
      });

      return dataElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
    });

    expect(dataElementXpaths).toEqual(["//*[@id='password']"]);

    await browser.goto(`${CONFIG.testUrl}login`); // reset styles/data
  });
});

describe("queryVisibleElements", () => {
  it("returns only visible elements for a given selector", async () => {
    const visibleElementXpaths = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.style.border = "0";
      username.style.padding = "0";
      username.style.width = "0";

      const actionElements = qawolf.find.queryVisibleElements("input");

      return actionElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
    });

    expect(visibleElementXpaths).toEqual(["//*[@id='password']"]);

    await browser.goto(`${CONFIG.testUrl}login`); // reset styles
  });
});
