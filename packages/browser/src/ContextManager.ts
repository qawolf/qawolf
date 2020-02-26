import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { CONTEXT as REPL_CONTEXT } from "@qawolf/repl";
import { FindPageOptions } from "@qawolf/types";
import { waitFor } from "@qawolf/web";
import { EventEmitter } from "events";
import { isNil } from "lodash";
import {
  BrowserContext as PlaywrightContext,
  Page as PlaywrightPage
} from "playwright-core";
import { Page, PageManager } from "./page/PageManager";

// Playwright Context decorated with ContextManager
export interface BrowserContext extends PlaywrightContext {
  qawolf(): ContextManager;
}

export class ContextManager extends EventEmitter {
  /**
   * Poll for pages and create their PageManagers.
   */
  private _context: BrowserContext;
  // public for tests
  public _disposed: boolean = false;
  private _nextIndex: number = 0;
  private _pageManagers: PageManager[] = [];
  private _pollPagesInterval: NodeJS.Timeout;

  constructor(context: PlaywrightContext) {
    super();

    // decorate a getter for this manager
    this._context = context as BrowserContext;
    this._context.qawolf = () => this;

    // constantly check for new pages to manage
    // workaround for https://github.com/microsoft/playwright/pull/645
    this._pollPagesInterval = setInterval(() => this._pollPagesToManage(), 100);

    context.on("close", () => this._dispose());
  }

  private _dispose() {
    this._disposed = true;
    this.removeAllListeners();
    clearInterval(this._pollPagesInterval);
  }

  private async _pollPagesToManage() {
    const pages = await this._context.pages();

    pages.forEach(async (page: PlaywrightPage) => {
      if ((page as any).qawolf) return;

      const manager = await PageManager.create({
        index: this._nextIndex++,
        logLevel: CONFIG.logLevel || "error",
        page
      });
      this._pageManagers.push(manager);

      manager.on("recorded_event", event => this.emit("recorded_event", event));
    });
  }

  public context() {
    return this._context;
  }

  public async findPage(options: FindPageOptions = {}): Promise<Page> {
    logger.debug(`ContextManager.findPage: ${JSON.stringify(options)}`);

    const index = options.page || 0;

    const timeoutMs = isNil(options.timeoutMs)
      ? CONFIG.timeoutMs
      : options.timeoutMs!;

    const manager = await waitFor(
      () => this._pageManagers.find(manager => manager.index() === index),
      timeoutMs,
      100
    );

    if (!manager) {
      throw new Error(
        `ContextManager.findPage: not found after ${timeoutMs}ms (index ${index})`
      );
    }

    if (options.waitForRequests !== false) {
      await manager.waitForRequests();
    }

    return manager.page();
  }
}

export const register = (context: PlaywrightContext) => {
  /**
   * Register and manage the playwright BrowserContext
   */
  if (!(context as any).qawolf) {
    new ContextManager(context);
  }

  // XXX move repl helper to jest-playwright
  REPL_CONTEXT.setContextKey("browser", context);

  return context as BrowserContext;
};
