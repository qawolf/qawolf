import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { Page, ElementHandle } from "puppeteer";
import { Browser } from "../../src/Browser";
import { findHtml } from "../../src/find";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());

const getXpath = async (element: ElementHandle<Element> | null) => {
  if (!element) return null;

  return element.evaluate(element => {
    const qawolf: QAWolfWeb = (window as any).qawolf;
    return qawolf.xpath.getXpath(element!);
  });
};

describe("findHtml", () => {
  it("finds an element by a strong key (name)", async () => {
    const element = await findHtml(page, '<input name="password" />', {
      timeoutMs: 0
    });

    expect(await getXpath(element)).toEqual("//*[@id='password']");
  });

  it("finds an element by data attribute", async () => {
    throw new Error("To Do");
    //   //     const elementXpath = await page.evaluate(() => {
    //   //       const qawolf: QAWolfWeb = (window as any).qawolf;
    //   //       const username = document.getElementById("username")!;
    //   //       const submit = document.getElementsByTagName("button")[0]!;
    //   //       username.setAttribute("data-qa", "username");
    //   //       submit.setAttribute("data-qa", "username");
    //   //       return qawolf.find
    //   //         .findElement({
    //   //           action: "type",
    //   //           dataAttribute: "data-qa",
    //   //           target: { dataValue: "username" },
    //   //           timeoutMs: 5000
    //   //         })
    //   //         .then((element: HTMLElement) => {
    //   //           username.removeAttribute("data-qa");
    //   //           submit.removeAttribute("data-qa");
    //   //           return qawolf.xpath.getXpath(element!);
    //   //         });
    //   //     });
    //   //     expect(elementXpath).toBe("//*[@id='username']");
  });

  it("returns null for a match below the threshold", async () => {
    throw new Error("To Do");

    //   //     const elementXpath = await page.evaluate(() => {
    //   //       const qawolf: QAWolfWeb = (window as any).qawolf;
    //   //       return qawolf.find
    //   //         .findElement({
    //   //           action: "type",
    //   //           dataAttribute: null,
    //   //           target: { labels: ["dropdown"], tagName: "select" },
    //   //           timeoutMs: 2000
    //   //         })
    //   //         .then((element: HTMLElement) => {
    //   //           if (!element) return null;
    //   //           return qawolf.xpath.getXpath(element);
    //   //         });
    //   //     });
    //   //     expect(elementXpath).toBeNull();
  });
});
