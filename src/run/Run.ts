import { ChildProcess, spawn } from 'child_process';
import Debug from 'debug';
import { EventEmitter } from 'events';
import { Socket } from 'net';
import { buildRunArguments, RunOptions } from './buildRunArguments';

const debug = Debug('qawolf:Run');

export class Run extends EventEmitter {
  _closed: boolean;
  _options: RunOptions;
  _process: ChildProcess;
  _socket: Socket;

  constructor(options: RunOptions) {
    super();
    this._options = options;
  }

  public async close(): Promise<void> {
    if (this._closed || !this._socket) return;
    this._closed = true;

    debug('close');

    if (this._socket.destroyed) return;

    const closedPromise = new Promise((resolve) => {
      this._socket.on('data', (data) => {
        const message = JSON.parse(data.toString());
        if (message.name === 'closed') {
          debug('received: closed');
          resolve();
        }
      });
    });

    this._socket.write(JSON.stringify({ name: 'close' }));
    await closedPromise;
  }

  public async kill() {
    debug('kill');

    await this.close();

    if (this._process) {
      debug('kill process');
      this._process.kill();
    }
  }

  public setConnection(socket: Socket): void {
    if (this._socket) throw new Error('Connection already set');

    debug('set connection');

    this._socket = socket;

    this._socket.on('data', (data) => {
      const message = JSON.parse(data.toString());
      if (message.name === 'codeupdate') {
        debug('received: codeupdate %o');
        this.emit('codeupdate', message.code);
      }
    });
  }

  public start(): void {
    if (this._process) throw new Error('Run already started');

    const args = buildRunArguments(this._options);

    const env = {
      ...this._options.env,
      // override env with process.env
      // ex. for unit tests we want QAW_BROWSER to override cli one
      ...process.env,
    };

    debug('start %o', args);

    this._process = spawn(args[0], args.slice(1), {
      env,
      stdio: 'inherit',
    });
  }
}
