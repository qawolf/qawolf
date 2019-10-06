import fs from "fs-extra";
import { platform } from "os";
import path from "path";
import puppeteer, { ElementHandle, Page, Serializable } from "puppeteer";
import { CONFIG } from "../config";
import { getDevice, Size } from "./device";
import { BrowserStep } from "../types";
import { sleep } from "../utils";
import { QAWolf } from "../web";

const webBundle = fs.readFileSync(
  path.resolve(__dirname, "../../dist/qawolf.web.js"),
  "utf8"
);

type BrowserCreateOptions = {
  url?: string;
  size?: Size;
};

export class Browser {
  /**
   * Wrap Browser and inject web library.
   */
  public _browser: puppeteer.Browser;
  private _device: puppeteer.devices.Device;
  private _currentPageIndex: number = 0;
  private _pages: Page[] = [];

  // protect constructor to force using async Browser.create()
  protected constructor(
    browser: puppeteer.Browser,
    device: puppeteer.devices.Device
  ) {
    this._browser = browser;
    this._device = device;
  }

  public static async create(options: BrowserCreateOptions = {}) {
    const device = getDevice(options.size);

    const launchOptions: puppeteer.LaunchOptions = {
      args: [
        "--no-default-browser-check",
        `--window-size=${device.viewport.width},${device.viewport.height}`
      ],
      defaultViewport: null,
      headless: CONFIG.headless,
      ignoreDefaultArgs: ["--enable-automation"]
    };

    if (platform() === "linux") {
      launchOptions!.args!.push("--disable-setuid-sandbox");
      launchOptions!.args!.push("--no-sandbox");
    }

    if (CONFIG.chromeExecutablePath) {
      launchOptions.executablePath = CONFIG.chromeExecutablePath;
    }

    const puppeteerBrowser = await puppeteer.launch(launchOptions);

    const browser = new Browser(puppeteerBrowser, device);
    await browser.wrapPages();

    if (options.url) await browser.goto(options.url);

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
      if (step.action === "scroll") {
        return this.scrollStep(page, step);
      } else {
        const elementHandle = await this.findElementHandleForStep(page, step);

        if (step.action === "click") {
          return elementHandle.click();
        } else {
          return this.typeStep(elementHandle, step);
        }
      }
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
      await page.emulate(this._device);
      this._pages.push(page);
    }

    this._browser.on("targetcreated", async target => {
      const page = await target.page();
      if (!page) return;

      await Promise.all([
        page.evaluate(webBundle),
        page.evaluateOnNewDocument(webBundle)
      ]);
      await page.emulate(this._device);
      this._pages.push(page);
    });
  }

  private async findElementHandleForStep(
    page: Page,
    step: BrowserStep
  ): Promise<ElementHandle> {
    const jsHandle = await page.evaluateHandle(
      step => {
        const qawolf: QAWolf = (window as any).qawolf;
        return qawolf.rank.waitForElement(step);
      },
      step as Serializable
    );

    const elementHandle = jsHandle.asElement()!;
    if (!elementHandle) {
      throw new Error(`No element handle found for step ${step}`);
    }

    return elementHandle;
  }

  private async scrollStep(page: Page, step: BrowserStep): Promise<void> {
    await page.evaluate(
      step => {
        const qawolf: QAWolf = (window as any).qawolf;
        return qawolf.actions.scrollTo(step.scrollTo!);
      },
      step as Serializable
    );
  }

  private async typeStep(
    elementHandle: ElementHandle,
    step: BrowserStep
  ): Promise<void> {
    const handleProperty = await elementHandle.getProperty("tagName");
    const tagName = await handleProperty.jsonValue();
    const value = step.value || "";

    if (tagName.toLowerCase() === "select") {
      await elementHandle.select(value); // returns array of strings
    } else {
      return elementHandle.type(value);
    }
  }
}

export const $xText = async (page: Page, xpath: string): Promise<string> => {
  try {
    const elements = await page.$x(xpath);

    const text = await page.evaluate(
      element => element.textContent,
      elements[0]
    );

    return text;
  } catch (error) {
    if (
      error.message ===
      "Execution context was destroyed, most likely because of a navigation."
    ) {
      // re-run if the page navigates
      return $xText(page, xpath);
    }

    throw error;
  }
};
