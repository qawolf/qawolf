import { CONFIG } from "@qawolf/config";
import { QAWolf } from "@qawolf/web";
import { Page } from "puppeteer";
import { Browser } from "../../src/Browser";

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

      return actionElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
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

      return actionElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
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

      return dataElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
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

      return dataElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
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

      return dataElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
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

      return actionElements.map((el: HTMLElement) => qawolf.xpath.getXpath(el));
    });

    expect(visibleElementXpaths).toEqual(["//*[@id='password']"]);

    await browser.goto(`${CONFIG.testUrl}login`); // reset styles
  });
});

describe("waitForElement", () => {
  test("returns top element by data attribute if specified", async () => {
    const elementXpath = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const username = document.getElementById("username")!;
      const submit = document.getElementsByTagName("button")[0]!;
      username.setAttribute("data-qa", "username");
      submit.setAttribute("data-qa", "username");

      return qawolf.locate
        .waitForElement({
          action: "input",
          dataAttribute: "data-qa",
          target: { dataValue: "username" },
          timeoutMs: 5000
        })
        .then((element: HTMLElement) => {
          username.removeAttribute("data-qa");
          submit.removeAttribute("data-qa");

          return qawolf.xpath.getXpath(element!);
        });
    });

    expect(elementXpath).toBe("//*[@id='username']");
  });

  test("returns top element by strong attribute if specified", async () => {
    const elementXpath = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const username = document.getElementById("username")!;
      const submit = document.getElementsByTagName("button")[0]!;
      username.setAttribute("data-qa", "username");
      submit.setAttribute("data-qa", "username");

      return qawolf.locate
        .waitForElement({
          action: "input",
          dataAttribute: "data-qa",
          target: { id: "username" },
          timeoutMs: 5000
        })
        .then((element: HTMLElement) => {
          username.removeAttribute("data-qa");
          submit.removeAttribute("data-qa");

          return qawolf.xpath.getXpath(element!);
        });
    });

    expect(elementXpath).toBe("//*[@id='username']");
  });

  test("returns best weak match if no strong matches found", async () => {
    const elementXpath = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.locate
        .waitForElement({
          action: "click",
          dataAttribute: null,
          target: { tagName: "button" },
          timeoutMs: 2000
        })
        .then((element: HTMLElement) => {
          return qawolf.xpath.getXpath(element!);
        });
    });

    expect(elementXpath).toBe("//*[@id='login']/button");
  });

  test("returns null if no test found", async () => {
    const elementXpath = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.locate
        .waitForElement({
          action: "input",
          dataAttribute: null,
          target: { labels: ["dropdown"], tagName: "select" },
          timeoutMs: 2000
        })
        .then((element: HTMLElement) => {
          if (!element) return null;
          return qawolf.xpath.getXpath(element);
        });
    });

    expect(elementXpath).toBeNull();
  });
});
