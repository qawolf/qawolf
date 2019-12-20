import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { ScreenCapture } from "@qawolf/screen";
import {
  Callback,
  Event,
  FindElementOptions,
  FindPageOptions,
  Selector,
  ScrollValue,
  TypeOptions
} from "@qawolf/types";
import { sortBy } from "lodash";
import { basename } from "path";
import { devices, DirectNavigationOptions, ElementHandle } from "puppeteer";
import { Browser } from "./Browser";
import { createDomReplayer } from "../page/createDomReplayer";
import { findPage } from "../page/findPage";
import { Page } from "../page/Page";

type ConstructorOptions = {
  browser: Browser;
  device: devices.Device;
  domPath?: string;
  recordEvents?: boolean;
};

export class QAWolfBrowser {
  private _createdAt: number;
  private _options: ConstructorOptions;
  // stored in order of open
  private _pages: Page[] = [];
  private _onClose: Callback[] = [];

  // used internally by findPage
  public _currentPageIndex: number = 0;
  // used internally by launch
  public _screenCapture: ScreenCapture | null = null;

  public constructor(options: ConstructorOptions) {
    const { ...clonedOptions } = options;
    this._options = clonedOptions;
    this._createdAt = Date.now();
  }

  public get browser(): Browser {
    return this._options.browser;
  }

  public async click(
    selector: Selector,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({ ...options, page: selector.page });
    return page.qawolf.click(selector, options);
  }

  public async close() {
    if (this._screenCapture) {
      await this._screenCapture.stop();
    }

    if (CONFIG.debug) {
      logger.verbose("Browser: skipping close in debug mode");
      return;
    }

    logger.verbose("Browser: close");

    const domPath = this.domPath;
    if (domPath) {
      await Promise.all(
        this.pages.map((page, index) =>
          createDomReplayer(
            page,
            `${domPath}/page_${index}__${this._createdAt}.html`
          )
        )
      );
    }

    this.pages.forEach(page => page.qawolf.dispose());

    await this.browser._close();
    logger.verbose("Browser: closed");

    this._onClose.forEach(c => c());
  }

  public get device() {
    return this._options.device;
  }

  public get domPath() {
    const path = this._options.domPath || CONFIG.domPath;
    if (!path) return;

    // name the dom path based on the main script filename
    // ex. /login.test.js/page_0.html
    return `${path}/${basename(require.main!.filename)}`;
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
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({ ...options, page: selector.page });
    return page.qawolf.find(selector, options);
  }

  public async findProperty(
    selector: Selector,
    property: string,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({ ...options, page: selector.page });
    return page.qawolf.findProperty(selector, property, options);
  }

  public async goto(
    url: string,
    options: FindPageOptions & DirectNavigationOptions = {}
  ): Promise<Page> {
    logger.verbose(`Browser: goto ${url}`);
    const page = await findPage(this.browser, options);

    await page.goto(url, {
      timeout: CONFIG.navigationTimeoutMs,
      ...options
    });

    return page;
  }

  public async hasText(
    text: string,
    options: FindPageOptions = {}
  ): Promise<boolean> {
    const page = await this.page(options);
    return page.qawolf.hasText(text, options);
  }

  public page(options: FindPageOptions = {}) {
    return findPage(this.browser, options);
  }

  public get pages() {
    return this._pages;
  }

  public get recordEvents() {
    return this._options.recordEvents;
  }

  public async scroll(
    selector: Selector,
    value: ScrollValue,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({ ...options, page: selector.page });
    return page.qawolf.scroll(selector, value, options);
  }

  public async select(
    selector: Selector,
    value: string | null,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({ ...options, page: selector.page });
    return page.qawolf.select(selector, value, options);
  }

  public async type(
    selector: Selector,
    value: string | null,
    options: FindElementOptions & TypeOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({ ...options, page: selector.page });
    return page.qawolf.type(selector, value, options);
  }

  public waitForClose() {
    return new Promise(resolve => {
      this._onClose.push(resolve);
    });
  }
}
