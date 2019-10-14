import { logger } from "@qawolf/logger";
import puppeteer, { Page } from "puppeteer";
import { launchPuppeteerBrowser } from "./browserUtils";
import { getDevice, Size } from "./device";
import { injectWebBundle } from "./pageUtils";
import { RequestTracker } from "./RequestTracker";
import { sleep } from "./sleep";

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
  private _requests: RequestTracker = new RequestTracker();

  // protect constructor to force using async Browser.create()
  protected constructor() {}

  public static async create(options: BrowserCreateOptions = {}) {
    /**
     * An async constructor for Browser.
     */
    logger.debug(`Browser: create ${JSON.stringify(options)}`);

    const self = new Browser();
    self._device = getDevice(options.size);
    self._browser = await launchPuppeteerBrowser(self._device);
    await self.managePages();

    if (options.url) await self.goto(options.url);

    return self;
  }

  public async close(): Promise<void> {
    await this._browser.close();
  }

  public currentPage(): Promise<Page> {
    // TODO change to not be async...
    return this.getPage(this._currentPageIndex);
  }

  public async goto(url: string): Promise<Page> {
    const page = await this.currentPage();
    await page.goto(url);
    return page;
  }

  public async getPage(
    index: number = 0,
    timeoutMs: number = 5000
  ): Promise<Page> {
    /**
     * Wait for the page at index to be ready and activate it.
     */
    logger.debug(`Browser: page(${index})`);

    // TODO change logic...
    for (let i = 0; i < timeoutMs / 100 && index >= this._pages.length; i++) {
      await sleep(100);
    }

    if (index >= this._pages.length) {
      throw new Error(`Browser: page(${index}) timed out`);
    }

    const page = this._pages[index];
    this._currentPageIndex = index;

    // when headless = false the tab needs to be activated
    // for the execution context to run
    await page.bringToFront();
    logger.debug(`Browser: page(${index}) activated ${page.url()}`);

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
