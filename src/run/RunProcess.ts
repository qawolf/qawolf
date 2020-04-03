import { ChildProcess, spawn } from 'child_process';
import Debug from 'debug';
import { EventEmitter } from 'events';
import { Socket } from 'net';
import split from 'split';
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

  async _stop(): Promise<void> {
    if (this._stopped || !this._socket) return;
    this._stopped = true;

    debug('stop');

    const hasStopped = new Promise((resolve) => {
      this.once('stopped', () => resolve());
    });

    this._socket.write(JSON.stringify({ name: 'stop' }) + '\n');

    await hasStopped;
  }

  public async kill(): Promise<void> {
    if (this._stopped) return;

    debug('kill');

    await this._stop();

    if (this._process) {
      debug('kill process');
      this._process.kill();
    }
  }

  public setConnection(socket: Socket): void {
    if (this._socket) throw new Error('Connection already set');

    debug('set connection');
    this._socket = socket;

    socket.setEncoding('utf8');

    this._socket.pipe(split()).on('data', (data: string) => {
      debug('received: %s', data);

      try {
        const message = JSON.parse(data);

        if (message.name === 'codeupdate') {
          this.emit('codeupdate', message.code);
        } else if (message.name === 'stopped') {
          this.emit('stopped');
        } else if (message.name === 'stoprunner') {
          this.emit('stoprunner');
        }
      } catch (e) {
        // ignore non JSON messages (last empty message)
      }
    });

    this._socket.on('close', () => {
      debug('received: close');
      this._socket = null;
      this.emit('close');
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
