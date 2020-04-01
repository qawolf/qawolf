import Debug from 'debug';
import { createConnection, Socket } from 'net';

const debug = Debug('qawolf:RunClient');

type CloseCallback = () => void | Promise<void>;

export class RunClient {
  private _onClose: CloseCallback[] = [];
  private _connection: Socket;

  constructor(port: number) {
    this._connection = createConnection({ port });

    this._connection.on('data', (data) => {
      const message = JSON.parse(data.toString());
      debug('received %o', message);

      if (message.name === 'close') this._close();
    });
  }

  public async _close() {
    await Promise.all(this._onClose.map((fn) => fn()));
    debug('send closed');
    this._connection.write(JSON.stringify({ name: 'closed' }));
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
