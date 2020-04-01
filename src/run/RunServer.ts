import Debug from 'debug';
import { FSWatcher, watch } from 'chokidar';
import { EventEmitter } from 'events';
import { readFile } from 'fs-extra';
import { AddressInfo, createServer, Server } from 'net';
import { RunOptions } from './buildRunArguments';
import { Run } from './Run';

const debug = Debug('qawolf:RunServer');

type RunServerOptions = RunOptions & {
  watch?: boolean;
};

export class RunServer extends EventEmitter {
  private _code: string;
  private _options: RunServerOptions;
  private _run: Run;
  private _watcher: FSWatcher;

  public static async start(options: RunServerOptions) {
    const server = new RunServer(options);
    await server._listen();

    server.createRun();

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
  }

  _listen() {
    return new Promise((resolve) => {
      this._server.listen(0, () => resolve());
    });
  }

  async _watch() {
    this._code = await readFile(this._options.codePath, 'utf8');

    this._watcher = watch(this._options.codePath, {
      atomic: 0,
      persistent: true,
    });

    this._watcher.on('change', async () => {
      const newCode = await readFile(this._options.codePath, 'utf8');
      if (newCode === this._code) return;

      debug('code changed, rerun');

      this._code = newCode;
      this.createRun();
    });
  }

  address(): AddressInfo {
    return this._server.address() as AddressInfo;
  }

  createRun() {
    debug('create run');
    if (this._run) this._run.kill();

    this._run = new Run({
      ...this._options,
      env: {
        ...this._options.env,
        QAW_RUN_SERVER_PORT: this.address().port.toString(),
      },
    });

    this._run.start();

    this._run.on('codeupdate', (code) => (this._code = code));
  }

  close() {
    if (this._watcher) this._watcher.close();

    this._server.close();
  }
}

// socket
// .on('error', (err) => {
//   console.error(err);
// });
