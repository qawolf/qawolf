import Debug from 'debug';
import { createConnection, Socket } from 'net';

const debug = Debug('qawolf:RunClient');

type CloseCallback = () => void | Promise<void>;

export class RunClient {
  private _connection: Socket;
  private _closed: boolean;
  private _onClose: CloseCallback[] = [];

  constructor(port: number) {
    this._connection = createConnection({ port });

    this._connection.on('data', (data) => {
      const message = JSON.parse(data.toString());
      debug('received %o', message);

      if (message.name === 'close') this._close();
    });
  }

  public async dispose() {
    if (this._closed || this._connection.destroyed) return;

    this._closed = true;
    this._connection.end();
  }

  public async _close() {
    if (this._closed) return;
    debug('close');

    this._closed = true;

    await Promise.all(this._onClose.map((fn) => fn()));
    if (this._connection.destroyed) return;

    debug('send closed');
    this._connection.write(JSON.stringify({ name: 'closed' }));
    this._connection.end();
  }

  public onClose(callback: CloseCallback) {
    this._onClose.push(callback);
  }

  public sendCodeUpdate(code: string) {
    debug('send code update');
    this._connection.write(JSON.stringify({ name: 'codeupdate', code }));
  }
}

const port = process.env.QAW_RUN_SERVER_PORT;

export const runClient = port ? new RunClient(Number(port)) : null;

if (port) {
  debug('created for %o', port);
} else {
  debug('no port');
}
