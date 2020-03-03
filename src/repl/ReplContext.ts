import { Callback } from '../types';

class ReplContext {
  private _context: any = {};

  private _changeListeners: Callback[] = [];

  context() {
    return this._context;
  }

  onChange(listener: Callback) {
    this._changeListeners.push(listener);
  }

  setContextKey(key: string, value: any) {
    this._context[key] = value;
    this._changeListeners.forEach(listener => listener(this._context));
  }
}

export const CONTEXT = new ReplContext();
