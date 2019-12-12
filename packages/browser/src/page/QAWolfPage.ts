import { logger } from "@qawolf/logger";
import {
  Event,
  FindElementOptions,
  Selector,
  ScrollValue
} from "@qawolf/types";
import { ElementHandle } from "puppeteer";
import { eventWithTime } from "rrweb/typings/types";
import {
  clickElement,
  scrollElement,
  selectElement,
  typeElement
} from "../actions";
import { find } from "../find/find";
import { findProperty } from "../find/findProperty";
import { hasText } from "../find/hasText";
import { Page } from "./Page";
import { RequestTracker } from "./RequestTracker";
import { retryExecutionError } from "../retry";

export class QAWolfPage {
  private _domEvents: eventWithTime[] = [];
  private _events: Event[] = [];
  private _index: number;
  private _page: Page;
  private _requests: RequestTracker;

  public constructor(page: Page, index: number) {
    this._page = page;
    this._index = index;
    this._requests = new RequestTracker(page);
  }

  public click(
    selector: Selector,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose(`Page ${this._index}: click`);

    return retryExecutionError(async () => {
      const element = await find(
        this._page,
        { ...selector, action: "click" },
        options
      );

      await clickElement(element);

      return element;
    });
  }

  public dispose() {
    this._requests.dispose();
  }

  public get domEvents() {
    return this._domEvents;
  }

  public get events() {
    return this._events;
  }

  public findProperty(
    selector: Selector,
    property: string,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose(`Page ${this._index}: findProperty`);

    return retryExecutionError(async () => {
      return findProperty(this._page, selector, property, options);
    });
  }

  public hasText(
    text: string,
    options: FindElementOptions = {}
  ): Promise<boolean> {
    logger.verbose(`Page ${this._index}: hasText`);

    return retryExecutionError(async () => {
      return hasText(this._page, text, options);
    });
  }

  public get index() {
    return this._index;
  }

  public scroll(
    selector: Selector,
    value: ScrollValue,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose(`Page ${this._index}: scroll`);

    return retryExecutionError(async () => {
      const element = await find(
        this._page,
        { ...selector, action: "scroll" },
        options
      );

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
      const element = await find(
        this._page,
        { ...selector, action: "select" },
        options
      );

      await selectElement(element, value, options);

      return element;
    });
  }

  public type(
    selector: Selector,
    value: string | null,
    options: FindElementOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose(`Page ${this._index}: type`);

    return retryExecutionError(async () => {
      const element = await find(
        this._page,
        { ...selector, action: "type" },
        { ...options }
      );

      await typeElement(this._page, element, value);

      return element;
    });
  }

  public waitForRequests() {
    return this._requests.waitUntilComplete();
  }
}
