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

// PuppeteerPage decorated with .qawolf: Page
export interface DecoratedPage extends PuppeteerPage {
  qawolf: Page;
}

export class Page {
  private _decorated: DecoratedPage;
  private _domEvents: eventWithTime[] = [];
  private _events: Event[] = [];
  private _index: number;
  private _recordDom: boolean;
  private _recordEvents: boolean;
  private _requests: RequestTracker;

  // protect constructor to force using async create()
  protected constructor(options: PageCreateOptions) {
    // decorate the PuppeteerPage with this as .qawolf
    const decorated = options.page as DecoratedPage;
    decorated.qawolf = this;
    this._decorated = decorated;

    this._index = options.index;
    this._recordDom = options.recordDom;
    this._recordEvents = options.recordEvents;
    this._requests = new RequestTracker(this._decorated);
  }

  public static async create(
    options: PageCreateOptions
  ): Promise<DecoratedPage> {
    const { device, page: puppeteerPage } = options;

    const page = new Page(options);

    await Promise.all([
      captureLogs(puppeteerPage),
      injectBundle(page.decorated, page._recordDom, page._recordEvents),
      puppeteerPage.emulate(device)
    ]);

    return page.decorated;
  }

  public get decorated(): DecoratedPage {
    return this._decorated;
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
