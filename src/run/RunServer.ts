import { FSWatcher, watch } from 'chokidar';
import Debug from 'debug';
import { EventEmitter } from 'events';
import { readFile } from 'fs-extra';
import { AddressInfo, createServer, Server } from 'net';
import { RunOptions } from './buildRunArguments';
import { RunProcess } from './RunProcess';
import { ShortcutListener } from './ShortcutListener';

type RunServerOptions = RunOptions & {
  watch?: boolean;
};

const debug = Debug('qawolf:RunServer');

export class RunServer extends EventEmitter {
  private _code: string;
  private _listener: ShortcutListener;
  private _options: RunServerOptions;
  private _run: RunProcess;
  private _watcher: FSWatcher;

  public static async start(options: RunServerOptions) {
    const server = new RunServer(options);
    await server._listen();

    server.startRun();

    if (options.watch) await server._watch();

    return server;
  }

  private _server: Server;

  protected constructor(options: RunServerOptions) {
    super();

    this._options = options;

    this._server = createServer((socket) => {
      this._run.setConnection(socket);
    });

    this._listener = new ShortcutListener();

    this._listener.on('exit', () => {
      debug('exit from key shortcut');
      this.close();
    });
  }

  _listen() {
    return new Promise((resolve) => {
      this._server.listen(0, () => resolve());
    });
  }

  async _watch() {
    debug('watch');

    this._code = await readFile(this._options.codePath, 'utf8');

    this._watcher = watch(this._options.codePath, {
      atomic: 0,
      persistent: true,
    });

    this._watcher.on('change', async () => {
      const newCode = await readFile(this._options.codePath, 'utf8');
      if (newCode === this._code) return;

      debug('code changed');
      this._code = newCode;
      this.startRun();
    });
  }

  startRun() {
    debug('start run');
    if (this._run) this._run.kill();

    const port = (this._server.address() as AddressInfo).port;

    const run = new RunProcess({
      ...this._options,
      env: {
        ...this._options.env,
        QAW_RUN_SERVER_PORT: port.toString(),
      },
    });

    this._run = run;

    run.start();

    run.on('codeupdate', (code) => {
      this._code = code;
    });

    run.on('stoprunner', () => {
      run.kill();
      this.close();
    });

    // TODO what about for create?

    if (!this._options.watch) {
      // when the run finishes, close
      run.on('close', () => {
        debug('run closed');
        this.close();
      });
    }
  }

  close() {
    debug('close');

    if (this._run) this._run.kill();

    if (this._watcher) this._watcher.close();

    this._server.close();

    this._listener.close();

    process.exit();
  }
}
