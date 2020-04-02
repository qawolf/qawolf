import { ChildProcess, spawn } from 'child_process';
import Debug from 'debug';
import { EventEmitter } from 'events';
import { Socket } from 'net';
import { buildRunArguments, RunOptions } from './buildRunArguments';

const debug = Debug('qawolf:RunProcess');

export class RunProcess extends EventEmitter {
  _options: RunOptions;
  _process: ChildProcess;
  _socket: Socket;
  _stopped: boolean;

  constructor(options: RunOptions) {
    super();
    this._options = options;
  }

  public async kill() {
    debug('kill');

    await this.stop();

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
      debug('received: %s', message.name);

      if (message.name === 'codeupdate') {
        this.emit('codeupdate', message.code);
      } else if (message.name === 'stopped') {
        this.emit('stopped');
      } else if (message.name === 'stoprunner') {
        this.emit('stoprunner');
      }
    });

    this._socket.on('close', () => {
      debug('received: close');
      this.emit('close');
      this._socket = null;
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

  public async stop(): Promise<void> {
    if (this._stopped || !this._socket) return;
    this._stopped = true;

    debug('stop');

    const hasStopped = new Promise((resolve) => {
      this._socket.on('data', (data) => {
        const message = JSON.parse(data.toString());
        if (message.name === 'stopped') {
          debug('received: stopped');
          resolve();
        }
      });
    });

    this._socket.write(JSON.stringify({ name: 'stop' }));
    await hasStopped;
  }
}
