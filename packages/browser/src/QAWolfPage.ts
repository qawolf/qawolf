import { logger } from "@qawolf/logger";
import { Event } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { readFileSync, outputFile } from "fs-extra";
import { compile } from "handlebars";
import { resolve } from "path";
import { devices, JSHandle, Page } from "puppeteer";
import { eventWithTime } from "rrweb/typings/types";
import { bundleJs } from "./bundleJs";
import { RequestTracker } from "./RequestTracker";
import { retryExecutionError } from "./retry";

export type PageCreateOptions = {
  device: devices.Device;
  page: Page;
  recordDom: boolean;
  recordEvents: boolean;
};

export interface DecoratedPage extends Page {
  qawolf: QAWolfPage;
}

const replayerTemplate = compile(
  readFileSync(resolve(__dirname, "../static/replayer.hbs"), "utf8")
);

export class QAWolfPage {
  private _domEvents: eventWithTime[] = [];
  private _events: Event[] = [];
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

    this._recordDom = options.recordDom;
    this._recordEvents = options.recordEvents;
    this._requests = new RequestTracker(this._page);
  }

  public static async create(options: PageCreateOptions) {
    const { device, page } = options;

    const qawolfPage = new QAWolfPage(options);

    await qawolfPage.exposeCallbacks();

    await Promise.all([
      qawolfPage.captureLogs(),
      qawolfPage.injectBundle(),
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

  public async createDomReplayer(path: string) {
    logger.debug(
      `QAWolfPage: create dom replayer for ${this._domEvents.length} events: ${path}`
    );
    if (!this._domEvents.length) return;

    // cycle event loop to ensure we get all events
    try {
      await this._page.evaluate(
        () => new Promise(resolve => setTimeout(resolve, 0))
      );
    } catch (e) {
      // ignore errors because the page could already be disposed
    }

    const replayer = replayerTemplate({
      eventsJson: JSON.stringify(this._domEvents).replace(
        /<\/script>/g,
        "<\\/script>"
      ),
      url: this._page.url()
    });

    await outputFile(path, replayer);
  }

  private async captureLogs() {
    // XXX port to rrweb
    this._page.on("console", async msg => {
      const url = this._page.url().substring(0, 40);

      try {
        const args = await Promise.all(
          msg.args().map(arg => formatJsHandle(arg))
        );
        const consoleMessage = args.filter(v => !!v).join(", ");
        if (!consoleMessage.length) return;

        // log as console.verbose(arg1, ...)
        logger.verbose(`${url} console.${msg.type()}(${consoleMessage})`);
      } catch (e) {
        // if argument parsing crashes log the original message
        // ex. when the context is destroyed due to page navigation
        // XXX this is why we need to change logging to be intercepted on the client
        logger.verbose(`${url}: ${msg.text()}`);
      }
    });

    const logError = (e: Error) => {
      logger.verbose(
        `page ${this._page
          .url()
          .substring(0, 40)}: console.error("${e.toString()}")`
      );
    };
    this._page.on("error", logError);
    this._page.on("pageerror", logError);
  }

  private async exposeCallbacks() {
    const promises = [];

    if (this._recordDom) {
      promises.push(
        this._page.exposeFunction("qaw_onDomEvent", (event: eventWithTime) =>
          this._domEvents.push(event)
        )
      );
    }

    if (this._recordEvents) {
      promises.push(
        this._page.exposeFunction("qaw_onEvent", (event: Event) => {
          logger.debug(`QAWolfPage: received event ${JSON.stringify(event)}`);
          this._events.push(event);
        })
      );
    }

    await Promise.all(promises);
  }

  private async injectBundle() {
    const bundle = bundleJs(this._recordDom, this._recordEvents);
    await Promise.all([
      retryExecutionError(() => this._page.evaluate(bundle)),
      this._page.evaluateOnNewDocument(bundle)
    ]);
  }
}

const formatJsHandle = (jsHandle: JSHandle) => {
  const element = jsHandle.asElement();

  return jsHandle.executionContext().evaluate(
    (obj, element) => {
      try {
        if (element) {
          // log elements by their xpath
          const qawolf: QAWolfWeb = (window as any).qawolf;
          return qawolf.xpath.getXpath(element);
        }

        return JSON.stringify(obj);
      } catch (e) {
        return obj.toString();
      }
    },
    jsHandle,
    element
  );
};
