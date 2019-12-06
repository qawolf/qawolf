import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Callback, Event, Selector, Size } from "@qawolf/types";
import { sortBy } from "lodash";
import puppeteer, {
  Browser as PuppeteerBrowser,
  devices,
  ElementHandle
} from "puppeteer";
import { closeBrowser } from "./closeBrowser";
import { getDevice } from "./device";
import { find, FindOptionsBrowser } from "../find";
import { launchPuppeteerBrowser } from "./launchPuppeteerBrowser";
import { managePages } from "./managePages";
import { findPage, FindPageOptions } from "../page/findPage";
import { DecoratedPage } from "../page/Page";
import { registry } from "./registry";

// PuppeteerBrowser decorated with our Browser and helpers
export interface DecoratedBrowser extends PuppeteerBrowser {
  find: (
    selector: Selector,
    options?: FindOptionsBrowser
  ) => Promise<ElementHandle>;
  page: (index?: number, timeoutMs?: number) => Promise<DecoratedPage>;
  qawolf: Browser;
}

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
  private _decorated: DecoratedBrowser;
  private _device: devices.Device;
  private _domPath?: string;
  private _recordEvents: boolean;
  // stored in order of open
  private _pages: DecoratedPage[] = [];
  private _onClose: Callback[] = [];

  // used internally by findPage
  public _currentPageIndex: number = 0;

  // private to force using async Browser.create()
  private constructor() {}

  public static async create(
    options: BrowserCreateOptions
  ): Promise<DecoratedBrowser> {
    /**
     * An async constructor for Browser.
     */
    logger.verbose(`Browser: create ${JSON.stringify(options)}`);

    const self = new Browser();

    const device = getDevice(options.size);

    // decorate the PuppeteerBrowser
    const browser = (await launchPuppeteerBrowser(device)) as DecoratedBrowser;
    browser.find = self.find.bind(self);
    browser.page = self.page.bind(self);
    browser.qawolf = self;
    self._decorated = browser;

    self._device = device;

    // TODO how to set this w/ test name?
    self._domPath = options.domPath || CONFIG.domPath;

    self._recordEvents = !!options.recordEvents;
    await managePages(self.decorated);

    if (options.url) await self.goto(options.url);

    registry.register(self.decorated);

    return self.decorated;
  }

  public static async close() {
    await registry.single().close();
  }

  public async close() {
    await closeBrowser(this.decorated);
    this._onClose.forEach(c => c());
  }

  public get decorated() {
    return this._decorated;
  }

  public get device() {
    return this._device;
  }

  public get domPath() {
    return this._domPath;
  }

  public get events() {
    const events: Event[] = [];

    this._pages.forEach(page =>
      page.qawolf.events.forEach(event => events.push(event))
    );

    return sortBy(events, e => e.time);
  }

  public get pages() {
    return this._pages;
  }

  public get recordEvents() {
    return this._recordEvents;
  }

  public async find(
    selector: Selector,
    options: FindOptionsBrowser = {}
  ): Promise<ElementHandle> {
    return find(selector, { ...options, browser: this._decorated });
  }

  public async goto(
    url: string,
    findPageOptions: FindPageOptions = {},
    goToOptions?: puppeteer.DirectNavigationOptions
  ): Promise<DecoratedPage> {
    logger.verbose(`Browser: goto ${url}`);
    const page = await findPage({
      ...findPageOptions,
      browser: this._decorated
    });

    await page.goto(url, {
      timeout: CONFIG.navigationTimeoutMs,
      ...goToOptions
    });

    return page;
  }

  public page(index?: number, timeoutMs: number = 5000) {
    return findPage({ browser: this.decorated, index, timeoutMs });
  }

  public waitForClose() {
    return new Promise(resolve => {
      this._onClose.push(resolve);
    });
  }
}
