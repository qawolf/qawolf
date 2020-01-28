import { logger } from "@qawolf/logger";
import {
  Event,
  FindElementOptions,
  Selector,
  ScrollValue,
  TypeOptions
} from "@qawolf/types";
import { omit } from "lodash";
import { ElementHandle, Page as PlaywrightPage } from "playwright";
import { eventWithTime } from "rrweb/typings/types";
import {
  clickElement,
  ClickOptions,
  scrollElement,
  selectElement,
  typeElement
} from "../actions";
import { find } from "../find/find";
import { findProperty } from "../find/findProperty";
import { hasText } from "../find/hasText";
import { injectBundle } from "./injectBundle";
import { Page } from "./Page";
import { retryExecutionError } from "../retry";

export type CreatePageOptions = {
  index: number;
  logLevel: string;
  playwrightPage: PlaywrightPage;
  recordDom?: boolean;
  recordEvents?: boolean;
};

export class QAWolfPage {
  private _domEvents: eventWithTime[] = [];
  private _events: Event[] = [];
  private _index: number;
  private _decorated: Page;

  private _ready: boolean = false;
  private _readyCallbacks: (() => void)[] = [];

  public constructor(options: CreatePageOptions) {
    logger.verbose(
      `QAWolfPage: create ${JSON.stringify(omit(options, "playwrightPage"))}`
    );

    this._index = options.index;

    // decorate the page
    this._decorated = options.playwrightPage as Page;
    this._decorated.qawolf = this;

    injectBundle({
      logLevel: options.logLevel,
      page: this._decorated,
      recordDom: options.recordDom,
      recordEvents: options.recordEvents
    }).then(() => {
      this._ready = true;
      this._readyCallbacks.forEach(cb => cb());
    });
  }

  public click(
    selector: Selector,
    options: FindElementOptions & ClickOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose(`Page ${this._index}: click`);

    return retryExecutionError(async () => {
      const element = await this.find(selector, {
        ...options,
        action: "click"
      });

      await clickElement(element, options);

      return element;
    });
  }

  public get decorated() {
    return this._decorated;
  }

  public get domEvents() {
    return this._domEvents;
  }

  public get events() {
    return this._events;
  }

  public find(
    selector: Selector,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    return find(this._decorated, selector, options);
  }

  public findProperty(
    selector: Selector,
    property: string,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose(`Page ${this._index}: findProperty`);

    return retryExecutionError(async () => {
      return findProperty(this._decorated, selector, property, options);
    });
  }

  public hasText(
    text: string,
    options: FindElementOptions = {}
  ): Promise<boolean> {
    logger.verbose(`Page ${this._index}: hasText`);

    return retryExecutionError(async () => {
      return hasText(this._decorated, text, options);
    });
  }

  public get index() {
    return this._index;
  }

  public ready() {
    if (this._ready) return true;

    return new Promise(resolve => this._readyCallbacks.push(resolve));
  }

  public scroll(
    selector: Selector,
    value: ScrollValue,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose(`Page ${this._index}: scroll`);

    return retryExecutionError(async () => {
      const element = await this.find(selector, {
        ...options,
        action: "scroll"
      });

      await scrollElement(element, value, options);

      return element;
    });
  }

  public select(
    selector: Selector,
    value: string | null,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose(`Page ${this._index}: select`);

    return retryExecutionError(async () => {
      const element = await this.find(selector, {
        ...options,
        action: "select"
      });

      await selectElement(element, value, options);

      return element;
    });
  }

  public type(
    selector: Selector,
    value: string | null,
    options: FindElementOptions & TypeOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose(`Page ${this._index}: type`);

    return retryExecutionError(async () => {
      logger.verbose("find element");
      const element = await this.find(selector, { ...options, action: "type" });

      logger.verbose("type element");
      await typeElement(this._decorated, element, value, options);

      return element;
    });
  }
}
