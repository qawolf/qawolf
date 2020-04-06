import { EventEmitter } from 'events';
import { Browser } from 'playwright';
import { watchBrowser } from '../watch/watchBrowser';

export class Registry extends EventEmitter {
  private static _instance = new Registry();

  public static data(): any {
    return this.instance()._data;
  }

  public static instance(): Registry {
    return this._instance;
  }

  public static setBrowser(browser: Browser): void {
    watchBrowser(browser);
    this.set('browser', browser);
  }

  public static set(key: string, value: any): void {
    const instance = this.instance();
    instance._data[key] = value;
    instance.emit('change', instance._data);
  }

  protected _data: {} = {};
}
