import { EventEmitter } from 'events';
import { Browser, BrowserContext } from 'playwright';
import { watchBrowser } from '../watch/watchBrowser';
import { Selectors } from '../types';
import * as qawolf from '../qawolf';

type RegistryData = {
  browser?: Browser;
  context?: BrowserContext;
  qawolf?: typeof qawolf;
  selectors?: Selectors;
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
    watchBrowser(browser);
    this._data.browser = browser;
    this.emit('change');
  }

  public setContext(context: BrowserContext): void {
    this._data.context = context;
    this.emit('change');
  }

  public setSelectors(selectors: Selectors): void {
    this._data.selectors = selectors;
    this.emit('change');
  }

  public setQawolf(value: typeof qawolf): void {
    this._data.qawolf = value;
    this.emit('change');
  }
}
