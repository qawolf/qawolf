import { EventEmitter } from 'events';
import { Browser, BrowserContext } from 'playwright-core';
import * as qawolf from '../qawolf';
import { watchBrowser } from '../watch/watchBrowser';
import { WatchHooks } from '../watch/WatchHooks';

type RegistryData = {
  browser?: Browser;
  context?: BrowserContext;
  qawolf?: typeof qawolf;
  [key: string]: any;
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

  public setValue(key: string, value: any): void {
    this._data[key] = value;
    this.emit('change');
  }

  public setBrowser(browser: Browser): void {
    if (WatchHooks.enabled()) {
      watchBrowser(browser);
    }

    this.setValue('browser', browser);
  }

  public setContext(context: BrowserContext): void {
    this.setValue('context', context);
  }

  public setQawolf(value: typeof qawolf): void {
    this.setValue('qawolf', value);
  }
}
