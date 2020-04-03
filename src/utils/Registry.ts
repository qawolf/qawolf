import { EventEmitter } from 'events';
import { Browser } from 'playwright';
import { Run } from '../run/Run';

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

    browser.on('disconnected', () => Run.close());

    Run.onStop(async () => {
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
    });
  }

  public static set(key: string, value: any): void {
    const instance = this.instance();
    instance._data[key] = value;
    instance.emit('change', instance._data);
  }

  protected _data: {} = {};
}
