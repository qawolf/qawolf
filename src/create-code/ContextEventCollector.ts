import Debug from 'debug';
import { EventEmitter } from 'events';
import { BrowserContext } from 'playwright-core';
import { webScript } from '../web/addScript';
import { loadConfig } from '../config';
import { ElementEvent } from '../types';
import { indexPages, IndexedPage } from '../utils';

const debug = Debug('qawolf:ContextEventCollector');

const ignoreError = (error: Error) => {
  // when an iframe closes it will throw an error we can ignore
  return !!['Session closed', 'Target closed'].find((ignore) =>
    error.message.includes(ignore),
  );
};

export class ContextEventCollector extends EventEmitter {
  readonly _attribute: string;
  readonly _context: BrowserContext;

  public static async create(
    context: BrowserContext,
  ): Promise<ContextEventCollector> {
    const collector = new ContextEventCollector(context);
    await collector._start();
    return collector;
  }

  protected constructor(context: BrowserContext) {
    super();
    this._attribute = loadConfig().attribute;
    this._context = context;
  }

  async _start(): Promise<void> {
    await indexPages(this._context);

    await this._context.exposeBinding(
      'qawElementEvent',
      ({ page }, elementEvent: ElementEvent) => {
        const pageIndex = (page as IndexedPage).createdIndex;
        const event: ElementEvent = { ...elementEvent, page: pageIndex };
        debug(`emit %j`, event);
        this.emit('elementevent', event);
      },
    );

    const script =
      '(() => {\n' +
      webScript +
      `\nnew qawolf.PageEventCollector({ attribute: ${JSON.stringify(
        this._attribute,
      )} });\n` +
      '})();';

    try {
      await Promise.all(
        this._context.pages().map((page) => page.evaluate(script)),
      );
    } catch (error) {
      if (!ignoreError(error)) throw error;

      debug('evaluate error we ignored: ' + error.message);
    }

    try {
      await this._context.addInitScript(script);
    } catch (error) {
      if (!ignoreError(error)) throw error;

      debug('addInitScript error we ignored: ' + error.message);
    }
  }
}
