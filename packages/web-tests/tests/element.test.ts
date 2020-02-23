import { BrowserContext, launch, Page } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";

let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  context = await launch({ url: `${CONFIG.sandboxUrl}login` });
  page = await context.page();
});

afterAll(() => context.close());

describe("getClickableAncestor", () => {
  it("chooses the top most clickable ancestor", async () => {
    const xpath = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const logInText = document.getElementsByTagName("p")[1]!;
      const ancestor = qawolf.element.getClickableAncestor(logInText);
      return qawolf.xpath.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='root']/form/button");
  });

  it("chooses the original element when there is no clickable ancestor", async () => {
    const xpath = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const button = document.getElementsByTagName("button")[0]!;
      const ancestor = qawolf.element.getClickableAncestor(button);
      return qawolf.xpath.getXpath(ancestor);
    });

    expect(xpath).toEqual("//*[@id='root']/form/button");
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

    await context.goto(`${CONFIG.sandboxUrl}login`); // reset styles
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
