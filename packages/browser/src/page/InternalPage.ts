import { Event } from "@qawolf/types";
import { eventWithTime } from "rrweb/typings/types";
import { Page } from "./Page";
import { RequestTracker } from "./RequestTracker";

export class InternalPage {
  private _domEvents: eventWithTime[] = [];
  private _events: Event[] = [];
  private _index: number;
  private _requests: RequestTracker;

  public constructor(page: Page) {
    this._requests = new RequestTracker(page);
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

  public waitForRequests() {
    return this._requests.waitUntilComplete();
  }
}
