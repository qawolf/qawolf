import { Page } from "puppeteer";
import { Browser } from "../browser/Browser";
import { CONFIG } from "../config";
import { QAWolf } from "./index";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

describe("isVisible", () => {
  test("returns true if element visible", async () => {
    const isElementVisible = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const username = document.getElementById("username")!;

      return qawolf.locate.isVisible(username);
    });

    expect(isElementVisible).toBe(true);
  });

  test("returns false if element has no width", async () => {
    const isElementVisible = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.style.border = "0";
      username.style.padding = "0";
      username.style.width = "0";

      return qawolf.locate.isVisible(username);
    });

    expect(isElementVisible).toBe(false);

    await browser.goto(`${CONFIG.testUrl}login`); // reset styles
  });
});

describe("queryActionElements", () => {
  test("returns all elements for click action", async () => {
    const actionElementCount = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const actionElements = qawolf.locate.queryActionElements("click");

      return actionElements.length;
    });

    expect(actionElementCount).toBe(28);
  });

  test("returns only input elements for input action", async () => {
    const actionElements = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const actionElements = qawolf.locate.queryActionElements("input");

      return actionElements.map(el => qawolf.xpath.getXpath(el));
    });

    expect(actionElements).toEqual([
      "//*[@id='username']",
      "//*[@id='password']"
    ]);
  });

  test("does not include elements that are not visible", async () => {
    const actionElementXpaths = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.style.border = "0";
      username.style.padding = "0";
      username.style.width = "0";

      const actionElements = qawolf.locate.queryActionElements("input");

      return actionElements.map(el => qawolf.xpath.getXpath(el));
    });

    expect(actionElementXpaths).toEqual(["//*[@id='password']"]);

    await browser.goto(`${CONFIG.testUrl}login`); // reset styles
  });
});

describe("queryDataElements", () => {
  test("returns all elements with given data value for click action", async () => {
    const dataElementXpaths = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const submit = document.getElementsByTagName("button")[0]!;
      submit.setAttribute("data-qa", "submit");

      const dataElements = qawolf.locate.queryDataElements({
        action: "click",
        dataAttribute: "data-qa",
        dataValue: "submit"
      });
      submit.removeAttribute("data-qa");

      return dataElements.map(el => qawolf.xpath.getXpath(el));
    });

    expect(dataElementXpaths).toEqual(["//*[@id='login']/button"]);
  });

  test("returns only input elements with given data value for input action", async () => {
    const dataElementXpaths = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const username = document.getElementById("username")!;
      const submit = document.getElementsByTagName("button")[0]!;
      username.setAttribute("data-qa", "username");
      submit.setAttribute("data-qa", "username");

      const dataElements = qawolf.locate.queryDataElements({
        action: "input",
        dataAttribute: "data-qa",
        dataValue: "username"
      });

      username.removeAttribute("data-qa");
      submit.removeAttribute("data-qa");

      return dataElements.map(el => qawolf.xpath.getXpath(el));
    });

    expect(dataElementXpaths).toEqual(["//*[@id='username']"]);
  });

  test("does not include elements that are not visible", async () => {
    const dataElementXpaths = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const username = document.getElementById("username")!;
      const password = document.getElementById("password")!;

      username.style.border = "0";
      username.style.padding = "0";
      username.style.width = "0";

      username.setAttribute("data-qa", "username");
      password.setAttribute("data-qa", "username");

      const dataElements = qawolf.locate.queryDataElements({
        action: "input",
        dataAttribute: "data-qa",
        dataValue: "username"
      });

      return dataElements.map(el => qawolf.xpath.getXpath(el));
    });

    expect(dataElementXpaths).toEqual(["//*[@id='password']"]);

    await browser.goto(`${CONFIG.testUrl}login`); // reset styles/data
  });
});

describe("queryVisibleElements", () => {
  test("returns only visible elements for a given selector", async () => {
    const visibleElementXpaths = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.style.border = "0";
      username.style.padding = "0";
      username.style.width = "0";

      const actionElements = qawolf.locate.queryVisibleElements("input");

      return actionElements.map(el => qawolf.xpath.getXpath(el));
    });

    expect(visibleElementXpaths).toEqual(["//*[@id='password']"]);

    await browser.goto(`${CONFIG.testUrl}login`); // reset styles
  });
});
