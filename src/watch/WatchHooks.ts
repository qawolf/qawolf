import { WatchClient } from './WatchClient';

type StopCallback = () => void | Promise<void>;

export class WatchHooks {
  private static _client: WatchClient;
  private static _onStop: StopCallback[] = [];
  private static _stopped: boolean;

  private static async _handleStop(): Promise<void> {
    if (this._stopped) return;

    this._stopped = true;

    const callbacks = this._onStop;
    await Promise.all(callbacks.map((fn) => fn()));

    this._client.close();
    this._client = null;
  }

  public static _connect(): void {
    const port = process.env.QAW_WATCH_SERVER_PORT;
    if (this._client || !port) return;

    this._client = new WatchClient(Number(port));
    this._client.once('stop', () => this._handleStop());
  }

  public static close(): void {
    // do not close the client in the middle of a stop
    if (this._stopped || !this._client) return;

    this._client.close();
    this._client = null;
  }

  public static codeUpdate(code: string): void {
    if (!this._client) return;

    this._client.sendCodeUpdate(code);
  }

  public static onStop(callback: StopCallback): void {
    this._onStop.push(callback);
  }
}

WatchHooks._connect();
