import Debug from 'debug';
import { EventEmitter } from 'events';
import { createConnection, Socket } from 'net';

const debug = Debug('qawolf:RunClient');

export class RunClient extends EventEmitter {
  private _connection: Socket;

  constructor(port: number) {
    super();
    debug('connect to port %o', port);
    this._connection = createConnection({ port });
    this._listen();
  }

  private _listen() {
    this._connection.on('data', (data) => {
      const message = JSON.parse(data.toString());
      debug('received %o', message);

      if (message.name === 'stop') this.emit('stop');
    });
  }

  private _send(value: any) {
    if (!this._connection) return;

    debug('send %s', value.name);
    this._connection.write(JSON.stringify(value));
  }

  public disconnect() {
    if (!this._connection) return;

    this._connection.end();
    this._connection = null;
    this.removeAllListeners();
  }

  public sendCodeUpdate(code: string) {
    this._send({ name: 'codeupdate', code });
  }

  public sendStopRunner() {
    this._send({ name: 'stoprunner' });
  }

  public sendStopped() {
    this._send({ name: 'stopped' });
  }
}
