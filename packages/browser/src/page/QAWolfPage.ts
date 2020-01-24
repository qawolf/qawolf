import { logger } from "@qawolf/logger";
import {
  Event,
  FindElementOptions,
  Selector,
  ScrollValue,
  TypeOptions
} from "@qawolf/types";
import { ElementHandle } from "playwright-core";
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
import { Page } from "./Page";
import { retryExecutionError } from "../retry";

export class QAWolfPage {
  private _domEvents: eventWithTime[] = [];
  private _events: Event[] = [];
  private _index: number;
  private _page: Page;

  public constructor(page: Page, index: number) {
    this._page = page;
    this._index = index;
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
    return find(this._page, selector, options);
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
      const element = await this.find(selector, { ...options, action: "type" });

      await typeElement(this._page, element, value, options);

      return element;
    });
  }
}
