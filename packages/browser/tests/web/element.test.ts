import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { Page } from "puppeteer";
import { Browser } from "../../src/Browser";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

describe("getClickableAncestor", () => {
  it("chooses the top most clickable ancestor", async () => {
    const xpath = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const submitIcon = document.getElementsByTagName("i")[0]!;
      const ancestor = qawolf.element.getClickableAncestor(
        submitIcon,
        "data-qa"
      );
      return qawolf.xpath.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='login']/button");
  });

  it("chooses the element with the data attribute if it finds one", async () => {
    const xpath = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const submitIcon = document.getElementsByTagName("i")[0]!;
      submitIcon.setAttribute("data-qa", "submit");

      const ancestor = qawolf.element.getClickableAncestor(
        submitIcon,
        "data-qa"
      );
      submitIcon.removeAttribute("data-qa");

      return qawolf.xpath.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='login']/button/i");
  });

  it("chooses the original element when there is no clickable ancestor", async () => {
    const xpath = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const button = document.getElementsByTagName("button")[0]!;
      const ancestor = qawolf.element.getClickableAncestor(button, "data-qa");
      return qawolf.xpath.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='login']/button");
  });
});

describe("getDataValue", () => {
  it("returns null if data attribute not specified in config", async () => {
    const dataAttribute = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.setAttribute("data-qa", "user");

      const result = qawolf.element.getDataValue(username, null);
      username.removeAttribute("data-qa");

      return result;
    });

    expect(dataAttribute).toBeNull();
  });

  it("returns null if element does not have specified data attribute", async () => {
    const dataAttribute = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.setAttribute("data-other", "user");

      const result = qawolf.element.getDataValue(username, "data-qa");
      username.removeAttribute("data-other");

      return result;
    });

    expect(dataAttribute).toBeNull();
  });

  it("returns data attribute value correctly", async () => {
    const dataAttribute = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.setAttribute("data-qa", "user");

      const result = qawolf.element.getDataValue(username, "data-qa");
      username.removeAttribute("data-qa");

      return result;
    });

    expect(dataAttribute).toBe("user");
  });
});

describe("isVisible", () => {
  it("returns true if element is visible", async () => {
    const isElementVisible = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;

      return qawolf.element.isVisible(username);
    });

    expect(isElementVisible).toBe(true);
  });

  it("returns false if element has no width", async () => {
    const isElementVisible = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      username.style.border = "0";
      username.style.padding = "0";
      username.style.width = "0";

      return qawolf.element.isVisible(username);
    });

    expect(isElementVisible).toBe(false);

    await browser.goto(`${CONFIG.testUrl}login`); // reset styles
  });
});

describe("isClickable", () => {
  it("returns true if element is clickable", async () => {
    const isClickable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const loginButton = document.getElementsByTagName("button")[0];
      return qawolf.element.isClickable(
        loginButton,
        window.getComputedStyle(loginButton)
      );
    });

    expect(isClickable).toBe(true);
  });

  it("returns false if element is not clickable", async () => {
    const isClickable = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      return qawolf.element.isClickable(
        username,
        window.getComputedStyle(username)
      );
    });

    expect(isClickable).toBe(false);
  });
});
