import Debug from 'debug';
import { EventEmitter } from 'events';
import { AddressInfo, createServer, Server, Socket } from 'net';
import split from 'split';

const debug = Debug('qawolf:WatchServer');

export class WatchServer extends EventEmitter {
  private _ready: Promise<void>;
  private _server: Server;
  private _socket: Socket;

  constructor() {
    super();

    this._server = createServer((socket) => {
      this._setSocket(socket);
    });

    this._ready = new Promise((resolve) => this._server.listen(0, resolve));
  }

  private _setSocket(socket: Socket) {
    this._socket = socket;

    this._socket.pipe(split()).on('data', (data: string) => {
      debug('received %o', data);

      try {
        const message = JSON.parse(data);
        if (message.name === 'codeupdate') {
          this.emit('codeupdate', message.code);
        } else if (message.name === 'stopwatch') {
          this.emit('stopwatch');
        } else if (message.name === 'teststopped') {
          this.emit('teststopped');
        }
      } catch (e) {
        // ignore non JSON messages (last empty message)
      }
    });
  }

  public async close(): Promise<void> {
    debug('close');
    this._server.close();
  }

  public async setEnv() {
    await this._ready;
    const address = this._server.address() as AddressInfo;
    debug('setEnv QAW_WATCH_SERVER_PORT %s', address.port);
    process.env.QAW_WATCH_SERVER_PORT = `${address.port}`;
  }

  public async stopTest() {
    if (!this._socket || this._socket.destroyed) return;
    debug('stoptest');

    try {
      const hasStopped = new Promise((resolve) => {
        this.once('teststopped', () => resolve());
      });

      this._socket.write(JSON.stringify({ name: 'stoptest' }) + '\n');

      await hasStopped;
    } catch (e) {
      debug('error sending stoptest %o', e);
    }
  }
}
