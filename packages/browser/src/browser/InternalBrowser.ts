import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Callback, Event, Selector } from "@qawolf/types";
import { sortBy } from "lodash";
import { devices, DirectNavigationOptions, ElementHandle } from "puppeteer";
import { Browser } from "./Browser";
import { find, FindOptionsBrowser } from "../find";
import { createDomReplayer } from "../page/createDomReplayer";
import { findPage, FindPageOptions } from "../page/findPage";
import { Page } from "../page/Page";

type ConstructorOptions = {
  browser: Browser;
  device: devices.Device;
  domPath?: string;
  recordEvents?: boolean;
};

export class InternalBrowser {
  private _options: ConstructorOptions;
  // stored in order of open
  private _pages: Page[] = [];
  private _onClose: Callback[] = [];

  // used internally by findPage
  public _currentPageIndex: number = 0;

  public constructor(options: ConstructorOptions) {
    const { ...clonedOptions } = options;
    this._options = clonedOptions;
  }

  public get browser(): Browser {
    return this._options.browser;
  }

  public async close() {
    if (CONFIG.debug) {
      logger.verbose("Browser: skipping close in debug mode");
      return;
    }

    logger.verbose("Browser: close");

    if (this._options.domPath) {
      await Promise.all(
        this.pages.map((page, index) =>
          createDomReplayer(page, `${this._options.domPath}/page_${index}.html`)
        )
      );
    }

    this.pages.forEach(page => page.qawolf.dispose());

    await this.close();
    logger.verbose("Browser: closed");

    this._onClose.forEach(c => c());
  }

  public get device() {
    return this._options.device;
  }

  public get domPath() {
    return this._options.domPath;
  }

  public get events() {
    const events: Event[] = [];

    this._pages.forEach(page =>
      page.qawolf.events.forEach(event => events.push(event))
    );

    return sortBy(events, e => e.time);
  }

  public async find(
    selector: Selector,
    options: FindOptionsBrowser = {}
  ): Promise<ElementHandle> {
    return find(selector, { ...options, browser: this.browser });
  }

  public async goto(
    url: string,
    options: FindPageOptions & DirectNavigationOptions = {}
  ): Promise<Page> {
    logger.verbose(`Browser: goto ${url}`);
    const page = await findPage({
      ...options,
      browser: this.browser
    });

    await page.goto(url, {
      timeout: CONFIG.navigationTimeoutMs,
      ...options
    });

    return page;
  }

  public page(index?: number, timeoutMs: number = 5000) {
    return findPage({ browser: this.browser, index, timeoutMs });
  }

  public get pages() {
    return this._pages;
  }

  public get recordEvents() {
    return this._options.recordEvents;
  }

  public waitForClose() {
    return new Promise(resolve => {
      this._onClose.push(resolve);
    });
  }
}
