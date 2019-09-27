import fs from "fs-extra";
import puppeteer, { Page, Serializable } from "puppeteer";
import { BrowserStep } from "../types";
import { sleep } from "../utils";
import { QAWolf } from "../web";

const webBundle = fs.readFileSync("build/qawolf.web.js", "utf8");

export class Browser {
  /**
   * Wrap Browser and inject web library.
   */
  private _browser: puppeteer.Browser;
  private _currentPageIndex: number = 0;
  private _pages: Page[] = [];

  // protect constructor to force using async Browser.create()
  protected constructor(browser: puppeteer.Browser) {
    this._browser = browser;
  }

  public static async create(url?: string) {
    const puppeteerBrowser = await puppeteer.launch({
      // needed for circleci
      args: ["–no-sandbox", "--disable-setuid-sandbox"],
      headless: false,
      defaultViewport: {
        height: 1080,
        width: 1920
      }
    });

    const browser = new Browser(puppeteerBrowser);
    await browser.wrapPages();

    if (url) await browser.goto(url);

    return browser;
  }

  public async close() {
    await this._browser.close();
  }

  public currentPage() {
    return this.page(this._currentPageIndex);
  }

  public async page(
    index: number = 0,
    timeoutMs: number = 5000
  ): Promise<Page> {
    for (let i = 0; i < timeoutMs / 100 && index >= this._pages.length; i++) {
      await sleep(100);
    }

    if (index >= this._pages.length) {
      throw new Error(`waiting for page ${index} timed out`);
    }

    this._currentPageIndex = index;

    return this._pages[index];
  }

  public async runStep(step: BrowserStep): Promise<void> {
    const page = await this.page(step.pageId);
    try {
      await page.evaluate(
        step => {
          const qawolf: QAWolf = (window as any).qawolf;
          return qawolf.runStep(step);
        },
        step as Serializable
      );
    } catch (error) {
      if (
        error.message ===
        "Execution context was destroyed, most likely because of a navigation."
      ) {
        // re-run the step if the page navigates
        return this.runStep(step);
      }

      throw error;
    }
  }

  public async goto(url: string) {
    const page = await this.currentPage();
    await page.goto(url);
    return page;
  }

  protected async wrapPages() {
    const pages = await this._browser.pages();
    for (let page of pages) {
      await Promise.all([
        page.evaluate(webBundle),
        page.evaluateOnNewDocument(webBundle)
      ]);
      this._pages.push(page);
    }

    this._browser.on("targetcreated", async target => {
      const page = await target.page();
      if (page) {
        await Promise.all([
          page.evaluate(webBundle),
          page.evaluateOnNewDocument(webBundle)
        ]);
        this._pages.push(page);
      }
    });
  }
}

export const $xText = async (page: Page, xpath: string) => {
  const elements = await page.$x(xpath);
  const text = await page.evaluate(element => element.textContent, elements[0]);
  return text;
};
