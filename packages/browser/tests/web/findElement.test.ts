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

describe("findElement", () => {
  it("returns top element by data attribute if specified", async () => {
    const elementXpath = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      const submit = document.getElementsByTagName("button")[0]!;
      username.setAttribute("data-qa", "username");
      submit.setAttribute("data-qa", "username");

      return qawolf.find
        .findElement({
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

  it("returns top element by strong attribute if specified", async () => {
    const elementXpath = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const username = document.getElementById("username")!;
      const submit = document.getElementsByTagName("button")[0]!;
      username.setAttribute("data-qa", "username");
      submit.setAttribute("data-qa", "username");

      return qawolf.find
        .findElement({
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

  it("returns best weak match if no strong matches found", async () => {
    const elementXpath = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.find
        .findElement({
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

  it("returns null if no test found", async () => {
    const elementXpath = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.find
        .findElement({
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
