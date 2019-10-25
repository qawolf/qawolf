import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Event } from "@qawolf/types";
import fs from "fs-extra";
import path from "path";
import { devices, Page } from "puppeteer";
import { RequestTracker } from "./RequestTracker";

const webBundle = fs.readFileSync(
  path.resolve(path.dirname(require.resolve("@qawolf/web")), "./qawolf.web.js"),
  "utf8"
);

type CreateOptions = {
  device: devices.Device;
  page: Page;
  record: boolean;
};

export interface DecoratedPage extends Page {
  qawolf: QAWolfPage;
}

export class QAWolfPage {
  protected _events: Event[] = [];
  private _page: DecoratedPage;
  private _requests: RequestTracker;

  // protect constructor to force using async create()
  protected constructor(options: CreateOptions) {
    // decorate the page with this parent
    const page = options.page as DecoratedPage;
    page.qawolf = this;
    this._page = page;

    this._requests = new RequestTracker(this._page);
  }

  public static async create(options: CreateOptions) {
    const { device, page } = options;

    const qawolfPage = new QAWolfPage(options);

    let bundle = webBundle;
    if (options.record) {
      // create the web Recorder and connect to this.onEvent
      await page.exposeFunction("qaw_onEvent", (event: any) => {
        logger.debug(`QAWolfPage: received event ${JSON.stringify(event)}`);
        qawolfPage._events.push(event);
      });

      bundle += `window.qaw_recorder = window.qaw_recorder || new qawolf.Recorder("${CONFIG.dataAttribute}", (event) => qaw_onEvent(event));`;
    }

    await Promise.all([
      page.evaluate(bundle),
      page.evaluateOnNewDocument(bundle),
      page.emulate(device)
    ]);

    return qawolfPage;
  }

  public dispose() {
    this._requests.dispose();
  }

  public get events() {
    return this._events;
  }

  public get super(): DecoratedPage {
    // return the super Page decorated with this as .qawolf
    return this._page;
  }

  public waitForRequests() {
    return this._requests.waitUntilComplete();
  }
}
