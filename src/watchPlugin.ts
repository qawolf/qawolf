import { AddressInfo, createServer, Server, Socket } from 'net';
// import split from 'split';

class WatchPlugin {
  private _ready: Promise<void>;
  private _server: Server;
  private _socket: Socket;

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

    // this._socket.pipe(split()).on('data', (data: string) => {
    //   debug('received: %s', data);

    //   try {
    //     const message = JSON.parse(data);

    //     // if (message.name === 'codeupdate') {
    //     //   this.emit('codeupdate', message.code);
    //     // } else if (message.name === 'stopped') {
    //     //   this.emit('stopped');
    //     // } else if (message.name === 'stoprunner') {
    //     //   this.emit('stoprunner');
    //     // }
    //   } catch (e) {
    //     // ignore non JSON messages (last empty message)
    //   }
    // });
  }

  apply(jestHooks) {
    jestHooks.shouldRunTestSuite(async () => {
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

  getUsageInfo() {}

  run() {}
}

module.exports = WatchPlugin;
