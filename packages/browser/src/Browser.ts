import { logger } from "@qawolf/logger";
import { BrowserStep, Size } from "@qawolf/types";
import { waitFor } from "@qawolf/web";
import puppeteer, { Page, ElementHandle } from "puppeteer";
import { launchPuppeteerBrowser } from "./browserUtils";
import { getDevice } from "./device";
import { findElement } from "./pageUtils";
import { QAWolfPage } from "./QAWolfPage";

export type BrowserCreateOptions = {
  size?: Size;
  url?: string;
};

export class Browser {
  /**
   * Wrap Browser and manage it's pages.
   */
  public _browser: puppeteer.Browser;
  private _currentPageIndex: number = 0;
  private _device: puppeteer.devices.Device;
  // stored in order of open
  private _pages: QAWolfPage[] = [];

  // protect constructor to force using async create()
  protected constructor() {}

  public static async create(options: BrowserCreateOptions = {}) {
    /**
     * An async constructor for Browser.
     */
    logger.verbose(`Browser: create ${JSON.stringify(options)}`);

    const self = new Browser();
    self._device = getDevice(options.size);
    self._browser = await launchPuppeteerBrowser(self._device);
    await self.managePages();

    if (options.url) await self.goto(options.url);

    return self;
  }

  public async close(): Promise<void> {
    for (let page of this._pages) {
      page.dispose();
    }

    await this._browser.close();
    logger.verbose("Browser: closed");
  }

  public currentPage(): Promise<Page> {
    return this.getPage(this._currentPageIndex);
  }

  public get device() {
    return this._device;
  }

  public async element(step: BrowserStep): Promise<ElementHandle> {
    const page = await this.getPage(step.pageId, true);
    return findElement(page, step);
  }

  public async goto(url: string): Promise<Page> {
    logger.verbose(`Browser: goto ${url}`);
    const page = await this.currentPage();
    await page.goto(url);
    return page;
  }

  public async getPage(
    index: number = 0,
    waitForRequests: boolean = false,
    timeoutMs: number = 5000
  ): Promise<Page> {
    /**
     * Wait for the page at index to be ready and activate it.
     */
    logger.verbose(`Browser: getPage(${index})`);

    const page = await waitFor(() => {
      if (index >= this._pages.length) return null;
      return this._pages[index];
    }, timeoutMs);

    if (!page) {
      throw new Error(`Browser: getPage(${index}) timed out`);
    }

    // when headless = false the tab needs to be activated
    // for the execution context to run
    await page.super.bringToFront();

    if (waitForRequests) {
      await page.waitForRequests();
    }

    this._currentPageIndex = index;
    logger.verbose(`Browser: getPage(${index}) activated ${page.super.url()}`);

    return page.super;
  }

  private async managePages() {
    const pages = await this._browser.pages();
    if (pages.length !== 1) {
      // we cannot ensure this._pages is ordered by open time
      // when there are multiple pages open at the start
      throw new Error("Must managePages before opening pages");
    }
    this._pages.push(await QAWolfPage.create(pages[0], this._device));

    this._browser.on("targetcreated", async target => {
      const page = await target.page();
      if (page) this._pages.push(await QAWolfPage.create(page, this._device));
    });
  }
}
