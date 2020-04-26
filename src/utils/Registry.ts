import { EventEmitter } from 'events';
import { Browser, BrowserContext } from 'playwright-core';
import * as qawolf from '../qawolf';
import { watchBrowser } from '../watch/watchBrowser';
import { WatchHooks } from '../watch/WatchHooks';

type RegistryData = {
  browser?: Browser;
  context?: BrowserContext;
  qawolf?: typeof qawolf;
};

export class Registry extends EventEmitter {
  private static _instance = new Registry();

  public static instance(): Registry {
    return this._instance;
  }

  private _data: RegistryData = {};

  public data(): RegistryData {
    return this._data;
  }

  public setBrowser(browser: Browser): void {
    if (WatchHooks.enabled()) {
      watchBrowser(browser);
    }

    this._data.browser = browser;
    this.emit('change');
  }

  public setContext(context: BrowserContext): void {
    this._data.context = context;
    this.emit('change');
  }

  public setQawolf(value: typeof qawolf): void {
    this._data.qawolf = value;
    this.emit('change');
  }
}
