import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { VirtualCapture } from "@qawolf/screen";
import {
  Event,
  FindElementOptions,
  FindPageOptions,
  Selector,
  ScrollValue,
  TypeOptions
} from "@qawolf/types";
import { sleep } from "@qawolf/web";
import { omit, sortBy } from "lodash";
import {
  Browser as PlaywrightBrowser,
  BrowserContext as PlaywrightBrowserContext,
  ElementHandle
} from "playwright";
import { GotoOptions } from "playwright-core/lib/frames";
import { DeviceDescriptor } from "playwright-core/lib/types";
import { ClickOptions } from "../actions/clickElement";
import { BrowserContext } from "./BrowserContext";
import { decorateBrowserContext } from "./decorateBrowserContext";
import { decoratePages, managePages } from "./decoratePages";
import { createDomArtifacts } from "../page/createDomArtifacts";
import { findPage } from "../page/findPage";
import { Page } from "../page/Page";
import { logTestStarted } from "./logTestStarted";

export interface CreateContextOptions {
  capture?: VirtualCapture;
  debug?: boolean;
  device: DeviceDescriptor;
  logLevel?: string;
  navigationTimeoutMs?: number;
  recordEvents?: boolean;
  url?: string;
}

export interface ConstructContextOptions extends CreateContextOptions {
  logLevel: string;
  playwrightBrowser: PlaywrightBrowser;
  playwrightContext: PlaywrightBrowserContext;
}

export class QAWolfBrowserContext {
  private _createdAt: number;
  private _decorated: BrowserContext;
  private _disposeManagePages: () => void;
  private _options: ConstructContextOptions;

  // public for test
  public _capture?: VirtualCapture;

  // used internally by findPage
  public _currentPageIndex: number = 0;

  // track these so we can access closed page events
  public _pages: Page[] = [];

  // used internally by managePages
  public _nextPageIndex: number = 0;

  protected constructor(options: ConstructContextOptions) {
    logger.verbose("QAWolfBrowser: construct");
    const { ...clonedOptions } = options;
    this._options = clonedOptions;

    this._capture = options.capture;
    this._createdAt = Date.now();
    this._decorated = decorateBrowserContext(options.playwrightContext, this);

    this._disposeManagePages = managePages(this);
  }

  public static async create(
    playwrightBrowser: PlaywrightBrowser,
    options: CreateContextOptions
  ): Promise<BrowserContext> {
    logger.verbose(
      `QAWolfBrowser: create ${JSON.stringify(omit(options, "capture"))}`
    );

    // create the context based on the device
    const playwrightContext = await playwrightBrowser.newContext({
      userAgent: options.device.userAgent,
      viewport: options.device.viewport
    });

    // create the initial page
    await playwrightContext.newPage();

    const qawolfContext = new QAWolfBrowserContext({
      ...options,
      debug: options.debug || CONFIG.debug,
      logLevel: options.logLevel || CONFIG.logLevel || "error",
      playwrightBrowser,
      playwrightContext
    });

    const context = qawolfContext.decorated;

    if (options.url) await context.goto(options.url);

    logTestStarted(context);

    if (options.capture) await options.capture.start();

    return context;
  }

  public get browser(): PlaywrightBrowser {
    return this._options.playwrightBrowser;
  }

  public get decorated(): BrowserContext {
    return this._decorated;
  }

  public get device() {
    return this._options.device;
  }

  public get logLevel() {
    return this._options.logLevel;
  }

  public get recordEvents() {
    return this._options.recordEvents;
  }

  public async click(
    selector: Selector,
    options: FindElementOptions & ClickOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({
      ...options,
      page: options.page
    });
    return page.qawolf.click(selector, options);
  }

  public async close() {
    if (CONFIG.sleepMs) {
      logger.verbose(`BrowserContext: sleep before close`);
      await sleep(CONFIG.sleepMs);
    }

    if (this._capture) {
      await this._capture.stop();
    }

    if (this._options.debug) {
      logger.verbose("BrowserContext: skipping close in debug mode");
      return;
    }

    logger.verbose("BrowserContext: close");
    this._disposeManagePages();

    await createDomArtifacts(this._pages, this._createdAt);

    await this._decorated.browser.close();

    logger.verbose("BrowserContext: closed");
  }

  public async events() {
    const events: Event[] = [];

    // cycle event loop to let events callback
    await sleep(0);

    this._pages.forEach(page =>
      page.qawolf.events.forEach(event => events.push(event))
    );

    return sortBy(events, e => e.time);
  }

  public async find(
    selector: Selector,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({
      ...options,
      page: options.page
    });
    return page.qawolf.find(selector, options);
  }

  public async findProperty(
    selector: Selector,
    property: string,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({
      ...options,
      page: options.page
    });
    return page.qawolf.findProperty(selector, property, options);
  }

  public async goto(
    url: string,
    options: FindPageOptions & GotoOptions = {}
  ): Promise<Page> {
    logger.verbose(`BrowserContext: goto ${url}`);
    const page = await findPage(this, options);

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
    return findPage(this, options);
  }

  public pages(): Promise<Page[]> {
    return decoratePages(this);
  }

  public async scroll(
    selector: Selector,
    value: ScrollValue,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({
      ...options,
      page: options.page
    });
    return page.qawolf.scroll(selector, value, options);
  }

  public async select(
    selector: Selector,
    value: string | null,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({
      ...options,
      page: options.page
    });
    return page.qawolf.select(selector, value, options);
  }

  public async type(
    selector: Selector,
    value: string | null,
    options: FindElementOptions & TypeOptions = {}
  ): Promise<ElementHandle> {
    const page = await this.page({
      ...options,
      page: options.page
    });

    return page.qawolf.type(selector, value, options);
  }
}
