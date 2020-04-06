import Debug from 'debug';
import { WatchClient } from './WatchClient';

type StopCallback = () => void | Promise<void>;

const debug = Debug('qawolf:WatchHooks');

export class WatchHooks {
  private static _client: WatchClient;
  private static _onStop: StopCallback[] = [];
  private static _stopped: boolean;

  private static async _handleStopTest(): Promise<void> {
    if (this._stopped) return;

    debug('stop test');
    this._stopped = true;

    const callbacks = this._onStop;
    await Promise.all(callbacks.map((fn) => fn()));
    debug('onStop hooks done');

    this._client.sendTestStopped();
    this._client.close();
    this._client = null;
  }

  public static _connect(): void {
    const port = process.env.QAW_WATCH_SERVER_PORT;
    if (this._client || !port) return;

    this._client = new WatchClient(Number(port));
    this._client.once('stoptest', () => this._handleStopTest());
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

  public static enabled(): boolean {
    return !!this._client;
  }

  public static onStop(callback: StopCallback): void {
    this._onStop.push(callback);
  }

  public static stopWatch(): void {
    if (!this._client) return;

    this._client.sendStopWatch();
  }
}

WatchHooks._connect();
