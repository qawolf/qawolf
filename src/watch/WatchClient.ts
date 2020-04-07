import Debug from 'debug';
import { EventEmitter } from 'events';
import { connect, Socket } from 'net';
import split from 'split';

const debug = Debug('qawolf:WatchClient');

export class WatchClient extends EventEmitter {
  private _socket: Socket;

  constructor(port: number) {
    super();

    debug('connect to port %o', port);
    this._socket = connect({ port });
    this._socket.setEncoding('utf8');

    this._listen();
  }

  private _listen(): void {
    this._socket.on('close', () => {
      this._socket = null;
    });

    this._socket.pipe(split()).on('data', (data: string) => {
      debug('received %o', data);

      try {
        const message = JSON.parse(data);
        if (message.name === 'stoptest') this.emit('stoptest');
      } catch (e) {
        // ignore non JSON messages (last empty message)
      }
    });
  }

  private _send(value: any): void {
    if (!this._socket) return;

    debug('send %s', value.name);
    this._socket.write(JSON.stringify(value) + '\n');
  }

  public close(): void {
    if (!this._socket) return;

    debug('close');
    this._socket.end();
    this._socket = null;
    this.removeAllListeners();
  }

  public sendCodeUpdate(code: string): void {
    this._send({ name: 'codeupdate', code });
  }

  public sendStopWatch(): void {
    this._send({ name: 'stopwatch' });
  }

  public sendTestStopped(): void {
    this._send({ name: 'teststopped' });
  }
}
