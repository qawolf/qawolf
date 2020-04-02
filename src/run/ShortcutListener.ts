import Debug from 'debug';
import { EventEmitter } from 'events';

const debug = Debug('qawolf:ShortcutListener');

const KEYS = {
  CONTROL_C: '\u0003',
  CONTROL_D: '\u0004',
};

export class ShortcutListener extends EventEmitter {
  private _closed: boolean;

  constructor() {
    super();
    this._listen();
  }

  private _listen() {
    const { stdin } = process;

    if (stdin.isTTY) stdin.setRawMode(true);

    stdin.setEncoding('utf8');

    stdin.on('data', this._onKeyPress);
  }

  private _onKeyPress = (key: string) => {
    if (key === KEYS.CONTROL_C || key === KEYS.CONTROL_D) {
      debug('emit: exit %o', key);
      this.emit('exit');
    }
  };

  public close() {
    if (this._closed) return;
    debug('close');

    this._closed = true;

    const { stdin } = process;
    stdin.removeListener('data', this._onKeyPress);

    this.removeAllListeners();
  }
}
