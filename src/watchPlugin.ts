import { watch } from 'chokidar';
import Debug from 'debug';
import { AddressInfo, createServer, Server, Socket } from 'net';
import split from 'split';
import { readFile } from 'fs-extra';

const debug = Debug('qawolf:watchPlugin');

class WatchPlugin {
  private _code: string;
  private _ready: Promise<void>;
  private _server: Server;
  private _socket: Socket;
  _watcher: any;

  constructor() {
    this._server = createServer((socket) => {
      this._setSocket(socket);
    });

    this._ready = new Promise((resolve) => {
      this._server.listen(0, () => resolve());
    });
  }

  _setSocket(socket: Socket) {
    this._socket = socket;

    this._socket.pipe(split()).on('data', (data: string) => {
      debug('received: %s', data);

      try {
        const message = JSON.parse(data);

        if (message.name === 'codeupdate') {
          this._code = message.code;
        }

        // else if (message.name === 'stopped') {
        //   this.emit('stopped');
        // } else if (message.name === 'stoprunner') {
        //   this.emit('stoprunner');
        // }
      } catch (e) {
        // ignore non JSON messages (last empty message)
      }
    });
  }

  apply(jestHooks) {
    jestHooks.shouldRunTestSuite(async (suite) => {
      this._watch(suite.testPath);

      await this._ready;
      const port = (this._server.address() as AddressInfo).port;
      process.env.QAW_RUN_SERVER_PORT = `${port}`;

      if (this._socket) {
        try {
          this._socket.write(JSON.stringify({ name: 'stop' }) + '\n');
        } catch (e) {}
      }

      return true;
    });

    jestHooks.onTestRunComplete(() => {
      // console.log('results', results);
    });
  }

  async _watch(testPath: string): Promise<void> {
    if (this._watcher) return;

    debug('watch');

    this._code = await readFile(testPath, 'utf8');

    this._watcher = watch(testPath, {
      atomic: 0,
      persistent: true,
    });

    this._watcher.on('change', async () => {
      const newCode = await readFile(testPath, 'utf8');
      if (newCode === this._code) return;

      debug('code changed');
      this._code = newCode;

      if (this._socket) {
        try {
          this._socket.write(JSON.stringify({ name: 'stop' }) + '\n');
        } catch (e) {}
      }
    });
  }

  getUsageInfo() {}

  run() {}
}

module.exports = WatchPlugin;
