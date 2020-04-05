import Debug from 'debug';
import { EventEmitter } from 'events';
import { Browser } from 'playwright';
import { WatchHooks } from '../watch/WatchHooks';

const debug = Debug('qawolf:Registry');

export class Registry extends EventEmitter {
  private static _instance = new Registry();

  public static data(): any {
    return this.instance()._data;
  }

  public static instance(): Registry {
    return this._instance;
  }

  public static setBrowser(browser: Browser): void {
    this.set('browser', browser);

    browser.on('disconnected', () => WatchHooks.close());

    // TODO stub browser.close to only close once
    WatchHooks.onStop(async () => {
      debug('close browser on stop');

      try {
        await browser.close();
      } catch (e) {
        // the browser might already be closed
      }

      if (browser.isConnected()) {
        await new Promise((resolve) => {
          browser.on('disconnected', resolve);
        });
      }

      debug('browser closed');
    });
  }

  public static set(key: string, value: any): void {
    const instance = this.instance();
    instance._data[key] = value;
    instance.emit('change', instance._data);
  }

  protected _data: {} = {};
}
