import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { ElementEvent, FindPageOptions } from "@qawolf/types";
import { waitFor } from "@qawolf/web";
import { EventEmitter } from "events";
import { isNil } from "lodash";
import { Page } from "./Page";

class PageRegistry extends EventEmitter {
  private _pages: Page[] = [];
  private _recordedEvents: ElementEvent[] = [];

  constructor() {
    super();
  }

  public async find(options: FindPageOptions): Promise<Page> {
    logger.debug(`PageRegistry.find: ${JSON.stringify(options)}`);

    const index = options.page || 0;

    const timeoutMs = isNil(options.timeoutMs)
      ? CONFIG.timeoutMs
      : options.timeoutMs!;

    const page = await waitFor(
      () => this._pages.find(page => index === page.qawolf().index()),
      timeoutMs
    );

    if (!page) {
      throw new Error(
        `PageRegistry.find: ${options.page} not found after ${timeoutMs}ms`
      );
    }

    if (options.bringToFront !== false) {
      await page.qawolf().bringToFront();
    }

    if (options.waitForRequests !== false) {
      await page.qawolf().waitForRequests();
    }

    return page;
  }

  public register(page: Page) {
    if (this._pages.includes(page)) return;

    logger.debug(`EventRegistry: register page ${page.qawolf().index()}`);
    this._pages.push(page);

    page.on("recorded_event", event => {
      logger.debug(`PageRegistry: "recorded_event" ${event.time}`);
      this._recordedEvents.push(event);
      this.emit("recorded_event", event);
    });
  }
}

export const PAGE_REGISTRY = new PageRegistry();
