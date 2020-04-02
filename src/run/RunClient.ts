import Debug from 'debug';
import { EventEmitter } from 'events';
import { createConnection, Socket } from 'net';
import split from 'split';

const debug = Debug('qawolf:RunClient');

export class RunClient extends EventEmitter {
  private _socket: Socket;

  constructor(port: number) {
    super();
    debug('connect to port %o', port);
    this._socket = createConnection({ port });
    this._socket.setEncoding('utf8');

    this._listen();
  }

  private _listen() {
    this._socket.pipe(split()).on('data', (data: string) => {
      debug('received %o', data);

      try {
        const message = JSON.parse(data);
        if (message.name === 'stop') this.emit('stop');
      } catch (e) {}
    });
  }

  private _send(value: any) {
    if (!this._socket) return;

    debug('send %s', value.name);
    this._socket.write(JSON.stringify(value) + '\n');
  }

  public close() {
    if (!this._socket) return;

    debug('close');

    this._socket.end();
    this._socket = null;
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
