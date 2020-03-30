import Debug from 'debug';
import { EventEmitter } from 'events';
import { BrowserContext, ChromiumBrowserContext } from 'playwright';
import { loadConfig } from '../config';
import { ElementEvent } from '../types';
import {
  forEachPage,
  IndexedPage,
  indexPages,
  initEvaluateScript,
} from '../utils';
import { NavigationListener } from './NavigationListener'
import { QAWolfWeb } from '../web';
import { addScriptToContext } from '../web/addScript';

const debug = Debug('qawolf:ContextEventCollector');

type ConstructorOptions = {
  attribute?: string;
  context: BrowserContext;
};

export class ContextEventCollector extends EventEmitter {
  public static async create(
    options: ConstructorOptions,
  ): Promise<ContextEventCollector> {
    await addScriptToContext(options.context);
    await indexPages(options.context);
    return new ContextEventCollector({
      attribute: loadConfig().attribute,
      ...options,
    });
  }

  private _attribute: string;

  protected constructor(options: ConstructorOptions) {
    super();

    this._attribute = options.attribute;

    forEachPage(options.context, (page) =>
      this._collectPageEvents(options.context, page as IndexedPage),
    );
  }

  private async _collectPageEvents(context: BrowserContext, page: IndexedPage): Promise<void> {
    if (page.isClosed()) return;

    const index = page.createdIndex;
    debug(`collect page events ${index} ${this._attribute}`);

    await page.exposeFunction('cp_collectEvent', (event: ElementEvent) => {
      debug(`emit %j`, event);
      this.emit('elementevent', event);
    });

    const navigationListener = new NavigationListener({
      context: context as ChromiumBrowserContext,
      page,
    });
    await navigationListener.init()

    await initEvaluateScript(
      page,
      ({ attribute, pageIndex }) => {
        const web: QAWolfWeb = (window as any).qawolf;

        new web.PageEventCollector({
          attribute,
          pageIndex,
          sendEvent: (window as any).cp_collectEvent,
        });
      },
      {
        attribute: this._attribute,
        pageIndex: index,
      },
    );
  }
}
