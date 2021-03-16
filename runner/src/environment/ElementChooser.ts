import Debug from "debug";
import { EventEmitter } from "events";
import { BrowserContext } from "playwright";

import { ElementChosen } from "../types";

const debug = Debug("qawolf:ElementChooser");

export class ElementChooser extends EventEmitter {
  _context?: BrowserContext;
  _contextEmitter?: EventEmitter;

  async setContext(context: BrowserContext): Promise<void> {
    this._context = context;

    // stop listening to the last context emitter
    if (this._contextEmitter) this._contextEmitter.removeAllListeners();

    const contextEmitter = new EventEmitter();
    this._contextEmitter = contextEmitter;

    contextEmitter.on("elementchosen", (event) => {
      debug("emit %j", event);
      this.emit("elementchosen", event);
    });

    await context.exposeBinding(
      "qawElementChosen",
      async (_, event: ElementChosen) => {
        contextEmitter.emit("elementchosen", event);
      }
    );
  }

  async start(): Promise<void> {
    const promises = (this._context?.pages() || []).map((page) => {
      if (page.isClosed()) return;

      return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const qawolf: any = (window as any).qawolf;
        return qawolf.elementChooser.start();
      });
    });

    await Promise.all(promises);
  }

  async stop(): Promise<void> {
    const promises = (this._context?.pages() || []).map((page) => {
      if (page.isClosed()) return;

      return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const qawolf: any = (window as any).qawolf;
        return qawolf.elementChooser.stop();
      });
    });

    await Promise.all(promises);
  }
}
