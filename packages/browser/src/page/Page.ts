import { Event } from "@qawolf/types";
import { devices, Page as PuppeteerPage } from "puppeteer";
import { eventWithTime } from "rrweb/typings/types";
import { captureLogs } from "./captureLogs";
import { injectBundle } from "./injectBundle";
import { RequestTracker } from "./RequestTracker";

export type PageCreateOptions = {
  device: devices.Device;
  page: PuppeteerPage;
  index: number;
  recordDom: boolean;
  recordEvents: boolean;
};

export interface DecoratedPage extends PuppeteerPage {
  qawolf: Page;
}

export class Page {
  private _domEvents: eventWithTime[] = [];
  private _events: Event[] = [];
  private _index: number;
  private _page: DecoratedPage;
  private _recordDom: boolean;
  private _recordEvents: boolean;
  private _requests: RequestTracker;

  // protect constructor to force using async create()
  protected constructor(options: PageCreateOptions) {
    // decorate the page with this parent
    const page = options.page as DecoratedPage;
    page.qawolf = this;
    this._page = page;

    this._index = options.index;
    this._recordDom = options.recordDom;
    this._recordEvents = options.recordEvents;
    this._requests = new RequestTracker(this._page);
  }

  public static async create(options: PageCreateOptions) {
    const { device, page: puppeteerPage } = options;

    const page = new Page(options);

    await Promise.all([
      captureLogs(puppeteerPage),
      injectBundle(page, page._recordDom, page._recordEvents),
      puppeteerPage.emulate(device)
    ]);

    return page;
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

  public get super(): DecoratedPage {
    // return the super Page decorated with this as .qawolf
    return this._page;
  }

  public waitForRequests() {
    return this._requests.waitUntilComplete();
  }
}
