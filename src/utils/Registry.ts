import { EventEmitter } from 'events';
import { runClient } from '../run/RunClient';

export class Registry extends EventEmitter {
  private static _instance = new Registry();

  public static data(): any {
    return this.instance()._data;
  }

  public static instance(): Registry {
    return this._instance;
  }

  public static set(key: string, value: any): void {
    const instance = this.instance();
    instance._data[key] = value;
    instance.emit('change', instance._data);

    if (key === 'browser') {
      if (runClient) {
        let closed = false;

        const originalClose = value.close.bind(value);

        value.close = () => {
          if (closed) return;

          closed = true;
          runClient.dispose();

          return originalClose();
        };

        runClient.onClose(() => value.close());
      }
    }
  }

  protected _data: {} = {};
}
