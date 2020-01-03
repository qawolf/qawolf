import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Capture, Display } from "@qawolf/screen";
import {
  Callback,
  Event,
  FindElementOptions,
  FindPageOptions,
  Selector,
  ScrollValue,
  TypeOptions
} from "@qawolf/types";
import { omit, sortBy } from "lodash";
import {
  Browser as PuppeteerBrowser,
  devices,
  DirectNavigationOptions,
  ElementHandle
} from "puppeteer";
import { Browser } from "./Browser";
import { createDomReplayer } from "../page/createDomReplayer";
import { decorateBrowser } from "./decorateBrowser";
import { findPage } from "../page/findPage";
import { Page } from "../page/Page";

export interface ConstructorOptions {
  debug?: boolean;
  device: devices.Device;
  display: Display | null;
  navigationTimeoutMs?: number;
  puppeteerBrowser: PuppeteerBrowser;
  recordEvents?: boolean;
}

export class QAWolfBrowser {
  private _browser: Browser;
  private _createdAt: number;
  private _display: Display | null;
  private _options: ConstructorOptions;
  // stored in order of open
  private _pages: Page[] = [];
  private _onClose: Callback[] = [];

  // used internally by launch
  public _capture: Capture | null = null;
  // used internally by findPage
  public _currentPageIndex: number = 0;

  public constructor(options: ConstructorOptions) {
    logger.verbose(
      `QAWolfBrowser: create ${JSON.stringify(
        omit(options, "display", "puppeteerBrowser")
      )}`
    );
    const { ...clonedOptions } = options;
    this._options = clonedOptions;
    this._createdAt = Date.now();
    this._browser = decorateBrowser(options.puppeteerBrowser, this);
    this._display = options.display;
  }

  public get browser(): Browser {
    return this._browser;
  }

  public async click(
    selector: Selector,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({ ...options, page: options.page || 0 });
    return page.qawolf.click(selector, options);
  }

  public async close() {
    if (this._capture) {
      await this._capture.stop();
    }

    if (this._display) {
      await this._display.stop();
    }

    if (this._options.debug) {
      logger.verbose("Browser: skipping close in debug mode");
      return;
    }

    logger.verbose("Browser: close");

    const artifactPath = CONFIG.artifactPath;
    if (artifactPath) {
      await Promise.all(
        this.pages.map((page, index) =>
          createDomReplayer(
            page,
            `${artifactPath}/page_${index}__${this._createdAt}.html`
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
    const page = await this.page({ ...options, page: options.page || 0 });
    return page.qawolf.find(selector, options);
  }

  public async findProperty(
    selector: Selector,
    property: string,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({ ...options, page: options.page || 0 });
    return page.qawolf.findProperty(selector, property, options);
  }

  public async goto(
    url: string,
    options: FindPageOptions & DirectNavigationOptions = {}
  ): Promise<Page> {
    logger.verbose(`Browser: goto ${url}`);
    const page = await findPage(this.browser, options);

    await page.goto(url, {
      timeout: this._options.navigationTimeoutMs,
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
    const page = await this.page({ ...options, page: options.page || 0 });
    return page.qawolf.scroll(selector, value, options);
  }

  public async select(
    selector: Selector,
    value: string | null,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({ ...options, page: options.page || 0 });
    return page.qawolf.select(selector, value, options);
  }

  public async type(
    selector: Selector,
    value: string | null,
    options: FindElementOptions & TypeOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({ ...options, page: options.page || 0 });
    return page.qawolf.type(selector, value, options);
  }

  public waitForClose() {
    return new Promise(resolve => {
      this._onClose.push(resolve);
    });
  }
}
