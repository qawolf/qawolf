import fs from "fs-extra";
import { platform } from "os";
import path from "path";
import puppeteer, { Page } from "puppeteer";
import { CONFIG } from "../config";
import { getDevice, Size } from "./device";
import { runStep } from "./runStep";
import { BrowserStep } from "../types";
import { sleep } from "../utils";

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

  public async goto(url: string) {
    const page = await this.currentPage();
    await page.goto(url);
    return page;
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

    const page = this._pages[index];
    this._currentPageIndex = index;

    // when headless = false the page needs to be up
    // front for the execution context to run
    await page.bringToFront();

    return page;
  }

  public async runStep(step: BrowserStep): Promise<void> {
    const page = await this.page(step.pageId);
    return runStep(page, step);
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
}
