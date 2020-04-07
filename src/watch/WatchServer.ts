import Debug from 'debug';
import { EventEmitter } from 'events';
import { AddressInfo, createServer, Server, Socket } from 'net';
import split from 'split';

const debug = Debug('qawolf:WatchServer');

export class WatchServer extends EventEmitter {
  _ready: Promise<void>;
  _server: Server;
  _socket: Socket;

  constructor() {
    super();

    this._server = createServer((socket) => {
      this._setSocket(socket);
    });

    this._ready = new Promise((resolve) => this._server.listen(0, resolve));
  }

  _setSocket(socket: Socket): void {
    debug('set socket %o', socket.address());
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

  public close(): void {
    debug('close');
    this._server.close();
  }

  public async port(): Promise<number> {
    await this._ready;
    const address = this._server.address() as AddressInfo;
    return address.port;
  }

  public async setEnv(env: NodeJS.ProcessEnv): Promise<void> {
    const port = await this.port();
    debug('setEnv QAW_WATCH_SERVER_PORT %s', port);
    env.QAW_WATCH_SERVER_PORT = `${port}`;
  }

  public async stopTest(): Promise<void> {
    if (!this._socket || this._socket.destroyed) return;

    debug('stop test');

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
