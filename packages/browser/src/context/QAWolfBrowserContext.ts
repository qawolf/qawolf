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
import { pick, sortBy } from "lodash";
import {
  Browser as PlaywrightBrowser,
  BrowserContext as PlaywrightBrowserContext,
  ElementHandle
} from "playwright-core";
// TODO
import { GotoOptions } from "playwright-core/lib/frames";
import { DeviceDescriptor } from "playwright-core/lib/types";
import { ClickOptions } from "../actions/clickElement";
import { BrowserContext } from "./BrowserContext";
import { decorateBrowserContext } from "./decorateBrowserContext";
import { decoratePages } from "./decoratePages";
import { createDomArtifacts } from "../page/createDomArtifacts";
import { findPage } from "../page/findPage";
import { Page } from "../page/Page";

export interface ConstructorOptions {
  capture: VirtualCapture | null;
  debug?: boolean;
  device: DeviceDescriptor;
  logLevel: string;
  navigationTimeoutMs?: number;
  playwrightBrowser: PlaywrightBrowser;
  playwrightBrowserContext: PlaywrightBrowserContext;
  recordEvents?: boolean;
}

export class QAWolfBrowserContext {
  private _createdAt: number;
  private _decorated: BrowserContext;
  private _options: ConstructorOptions;

  // public for test
  public _capture: VirtualCapture | null = null;

  // used internally by findPage
  public _currentPageIndex: number = 0;

  // used internally by managePages
  public _nextPageIndex: number = 0;

  public constructor(options: ConstructorOptions) {
    logger.verbose(
      `QAWolfBrowser: create ${JSON.stringify(
        pick(options, "debug", "device", "navigationTimeoutMs", "recordEvents")
      )}`
    );
    const { ...clonedOptions } = options;
    this._options = clonedOptions;

    this._capture = options.capture;
    this._createdAt = Date.now();
    this._decorated = decorateBrowserContext(
      options.playwrightBrowserContext,
      this
    );
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

    const pages = await this.pages();
    await createDomArtifacts(pages, this._createdAt);

    await this._decorated.browser.close();

    logger.verbose("BrowserContext: closed");
  }

  public async events() {
    const events: Event[] = [];

    const pages = await this.pages();

    pages.forEach(page =>
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
