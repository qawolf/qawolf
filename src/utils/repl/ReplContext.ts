import { EventEmitter } from 'events';

export class ReplContext extends EventEmitter {
  private static _instance = new ReplContext();

  public static data(): any {
    return this.instance()._data;
  }

  public static instance(): ReplContext {
    return this._instance;
  }

  public static set(key: string, value: any): void {
    const instance = this.instance();
    instance._data[key] = value;
    instance.emit('change', instance._data);
  }

  protected _data: {} = {};
}
