import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { BrowserStep, Locator, Size } from "@qawolf/types";
import { QAWolfWeb, waitFor } from "@qawolf/web";
import puppeteer, { Page, ElementHandle, Serializable } from "puppeteer";
import { launchPuppeteerBrowser } from "./browserUtils";
import { getDevice } from "./device";
import { injectWebBundle } from "./pageUtils";
import { RequestTracker } from "./RequestTracker";

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
  private _pages: Page[] = [];
  private _requests: RequestTracker;

  // protect constructor to force using async Browser.create()
  protected constructor() {
    this._requests = new RequestTracker();
  }

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
    this._requests.dispose();
    await this._browser.close();
    logger.verbose("Browser: closed");
  }

  public currentPage(): Promise<Page> {
    return this.getPage(this._currentPageIndex);
  }

  public async element(step: BrowserStep): Promise<ElementHandle> {
    logger.verbose(
      `Browser: find element for ${JSON.stringify(step.target).substring(
        0,
        100
      )}`
    );

    const page = await this.getPage(step.pageId, true);

    const jsHandle = await page.evaluateHandle(
      (locator: Locator) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        return qawolf.locate.waitForElement(locator);
      },
      {
        action: step.action,
        dataAttribute: CONFIG.dataAttribute,
        target: step.target,
        timeoutMs: CONFIG.locatorTimeoutMs,
        value: step.value
      } as Serializable
    );

    const handle = jsHandle.asElement();
    if (!handle) {
      throw new Error(`No element handle found for step ${step}`);
    }

    return handle;
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
    await page.bringToFront();
    if (waitForRequests) {
      await this._requests.waitUntilComplete(page);
    }

    this._currentPageIndex = index;
    logger.verbose(`Browser: getPage(${index}) activated ${page.url()}`);

    return page;
  }

  private async managePage(page: Page) {
    await injectWebBundle(page);
    await page.emulate(this._device);
    this._requests.track(page);
    this._pages.push(page);
  }

  private async managePages() {
    const pages = await this._browser.pages();
    if (pages.length !== 1) {
      // we cannot ensure this._pages is ordered by open time
      // when there are multiple pages open at the start
      throw new Error("Must managePages before opening pages");
    }
    await this.managePage(pages[0]);

    this._browser.on("targetcreated", async target => {
      const page = await target.page();
      if (page) this.managePage(page);
    });
  }
}
