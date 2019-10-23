import fs from "fs-extra";
import path from "path";
import { devices, Page } from "puppeteer";
import { RequestTracker } from "./RequestTracker";

const webBundle = fs.readFileSync(
  path.resolve(path.dirname(require.resolve("@qawolf/web")), "./qawolf.web.js"),
  "utf8"
);

export class QAWolfPage {
  private _page: Page;
  private _requests: RequestTracker;

  // protect constructor to force using async create()
  protected constructor(page: Page) {
    this._page = page;
    this._requests = new RequestTracker(page);
  }

  public static async create(page: Page, device: devices.Device) {
    await Promise.all([
      page.evaluate(webBundle),
      page.evaluateOnNewDocument(webBundle),
      page.emulate(device)
    ]);

    return new QAWolfPage(page);
  }

  public dispose() {
    this._requests.dispose();
  }

  public get super() {
    return this._page;
  }

  public waitForRequests() {
    return this._requests.waitUntilComplete();
  }
}
