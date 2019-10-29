import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Event } from "@qawolf/types";
import fs from "fs-extra";
import path from "path";
import { devices, JSHandle, Page } from "puppeteer";
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

    await Promise.all([
      qawolfPage.captureLogs(),
      qawolfPage.injectBundle(options.record),
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

  private async captureLogs() {
    const toString = (jsHandle: JSHandle) =>
      jsHandle.executionContext().evaluate(obj => {
        return obj instanceof HTMLElement
          ? obj.outerHTML.replace(/(\r\n|\n|\r)/gm, "").substring(0, 100)
          : JSON.stringify(obj);
      }, jsHandle);

    this._page.on("console", async msg => {
      try {
        const args = await Promise.all(msg.args().map(arg => toString(arg)));
        const consoleMessage = args.filter(v => !!v).join(", ");
        if (consoleMessage.length) {
          logger.verbose(
            `${this._page
              .url()
              .substring(0, 40)} console.${msg.type()}(${consoleMessage})`
          );
        }
      } catch (e) {
        // if argument parsing crashes log the original message
        // ex. when the context is destroyed due to page navigation
        logger.verbose(`${this._page.url().substring(0, 40)}: ${msg.text()}`);
      }
    });

    const logError = (e: Error) => {
      logger.error(
        `page ${this._page.url().substring(0, 40)}: ${e.toString()}`
      );
    };
    this._page.on("error", logError);
    this._page.on("pageerror", logError);
  }

  private async injectBundle(record: boolean) {
    let bundle = webBundle;
    if (record) {
      // create the web Recorder and connect to this.onEvent
      await this._page.exposeFunction("qaw_onEvent", (event: Event) => {
        logger.debug(`QAWolfPage: received event ${JSON.stringify(event)}`);
        this._events.push(event);
      });

      bundle += `window.qaw_recorder = window.qaw_recorder || new qawolf.Recorder("${CONFIG.dataAttribute}", (event) => qaw_onEvent(event));`;
    }

    await Promise.all([
      this._page.evaluate(bundle),
      this._page.evaluateOnNewDocument(bundle)
    ]);
  }
}
