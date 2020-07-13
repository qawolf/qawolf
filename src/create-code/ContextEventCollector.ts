import Debug from 'debug';
import { EventEmitter } from 'events';
import { BrowserContext } from 'playwright-core';
import { IndexedPage, isRegistered } from '../utils/context/register';
import { ElementEvent } from '../types';

const debug = Debug('qawolf:ContextEventCollector');

export class ContextEventCollector extends EventEmitter {
  readonly _attribute: string;
  readonly _context: BrowserContext;

  public static async create(
    context: BrowserContext,
  ): Promise<ContextEventCollector> {
    const collector = new ContextEventCollector(context);
    await collector._emitEvents();
    return collector;
  }

  protected constructor(context: BrowserContext) {
    super();
    this._context = context;
  }

  async _emitEvents(): Promise<void> {
    if (!isRegistered(this._context)) {
      throw new Error('Use qawolf.register(context) first');
    }

    await this._context.exposeBinding(
      'qawElementEvent',
      ({ page }, elementEvent: ElementEvent) => {
        const pageIndex = (page as IndexedPage).createdIndex;
        const event: ElementEvent = { ...elementEvent, page: pageIndex };
        debug(`emit %j`, event);
        this.emit('elementevent', event);
      },
    );
  }
}
