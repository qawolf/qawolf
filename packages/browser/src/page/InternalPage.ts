import { logger } from "@qawolf/logger";
import { Event, FindOptions, Selector, ScrollValue } from "@qawolf/types";
import { ElementHandle } from "puppeteer";
import { eventWithTime } from "rrweb/typings/types";
import {
  clickElement,
  scrollElement,
  selectElement,
  typeElement
} from "../actions";
import { find } from "../find/find";
import { Page } from "./Page";
import { RequestTracker } from "./RequestTracker";
import { retryExecutionError } from "../retry";

export class InternalPage {
  private _domEvents: eventWithTime[] = [];
  private _events: Event[] = [];
  private _index: number;
  private _page: Page;
  private _requests: RequestTracker;

  public constructor(page: Page) {
    this._page = page;
    this._requests = new RequestTracker(page);
  }

  public click(
    selector: Selector,
    options: FindOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose("click");

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

  public get index() {
    return this._index;
  }

  public scroll(
    selector: Selector,
    value: ScrollValue,
    options: FindOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose("scroll");

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
    options: FindOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose("select");

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
    options: FindOptions = {}
  ): Promise<ElementHandle> {
    logger.verbose("type");

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
