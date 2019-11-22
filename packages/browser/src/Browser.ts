import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Callback, Event, Size, Step } from "@qawolf/types";
import { waitFor } from "@qawolf/web";
import { sortBy } from "lodash";
import puppeteer, { devices, ElementHandle } from "puppeteer";
import { getDevice } from "./device";
import { findElement } from "./find";
import { launchPuppeteerBrowser } from "./launch";
import { DecoratedPage, QAWolfPage } from "./QAWolfPage";

export type BrowserCreateOptions = {
  domPath?: string;
  recordEvents?: boolean;
  size?: Size;
  url?: string;
};

export class Browser {
  /**
   * Wrap Browser and manage it's pages.
   */
  private _browser: puppeteer.Browser;
  private _currentPageIndex: number = 0;
  private _device: devices.Device;
  private _domPath?: string;
  private _onClose: Callback[] = [];
  // stored in order of open
  private _pages: QAWolfPage[] = [];
  private _recordEvents: boolean;

  // protect constructor to force using async create()
  protected constructor() {}

  public static async create(options: BrowserCreateOptions = {}) {
    /**
     * An async constructor for Browser.
     */
    logger.verbose(`Browser: create ${JSON.stringify(options)}`);

    const self = new Browser();

    const device = getDevice(options.size);
    self._browser = await launchPuppeteerBrowser(device);
    self._device = device;
    self._domPath = options.domPath;
    self._recordEvents = !!options.recordEvents;
    await self.managePages();

    if (options.url) await self.goto(options.url);

    return self;
  }

  public async close(): Promise<void> {
    if (CONFIG.debug) {
      logger.verbose("Browser: skipping close in debug mode");
      return;
    }

    logger.verbose("Browser: close");

    if (this._domPath) {
      await Promise.all(
        this._pages.map((page, index) =>
          page.createDomReplayer(`${this._domPath}/page_${index}.html`)
        )
      );
    }
    this._pages.forEach(page => page.dispose());

    await this._browser.close();
    this._onClose.forEach(c => c());
    logger.verbose("Browser: closed");
  }

  public currentPage(waitForRequests: boolean = true): Promise<DecoratedPage> {
    return this.getPage(this._currentPageIndex, waitForRequests);
  }

  public get device() {
    return this._device;
  }

  public async element(
    step: Step,
    waitForRequests: boolean = true,
    timeoutMs?: number
  ): Promise<ElementHandle> {
    const page = await this.getPage(step.pageId, waitForRequests);
    return findElement(page, step, timeoutMs);
  }

  public get events() {
    const events: Event[] = [];

    this._pages.forEach((page, index) =>
      page.events.forEach(event => events.push({ ...event, pageId: index }))
    );

    return sortBy(events, e => e.time);
  }

  public async goto(
    url: string,
    options?: puppeteer.DirectNavigationOptions
  ): Promise<DecoratedPage> {
    logger.verbose(`Browser: goto ${url}`);
    const page = await this.currentPage();
    await page.goto(url, {
      timeout: CONFIG.navigationTimeoutMs,
      ...options
    });
    return page;
  }

  public async getPage(
    index: number = 0,
    waitForRequests: boolean = false,
    timeoutMs: number = 5000
  ): Promise<DecoratedPage> {
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

  public get super() {
    return this._browser;
  }

  public waitForClose() {
    return new Promise(resolve => {
      this._onClose.push(resolve);
    });
  }

  private async managePages() {
    const pages = await this._browser.pages();
    if (pages.length !== 1) {
      // we cannot ensure this._pages is ordered by open time
      // when there are multiple pages open at the start
      throw new Error("Must managePages before opening pages");
    }

    const options = {
      device: this._device,
      recordDom: !!this._domPath,
      recordEvents: this._recordEvents
    };

    this._pages.push(await QAWolfPage.create({ ...options, page: pages[0] }));

    this._browser.on("targetcreated", async target => {
      const page = await target.page();
      if (page) this._pages.push(await QAWolfPage.create({ ...options, page }));
    });

    this._browser.on("targetdestroyed", async () => {
      // close the browser all pages are closed
      const pages = await this._browser.pages();
      if (pages.length === 0) {
        await this.close();
      }
    });
  }
}
