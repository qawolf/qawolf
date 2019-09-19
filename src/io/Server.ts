import { slug } from "cuid";
import { createServer, Server as HttpServer } from "http";
import SocketIO from "socket.io";
import { Browser } from "../Browser";
import { CONFIG } from "../config";
import { ConnectOptions } from "../web/Client";
import { QAWolf } from "../web/index";
import { Connection } from "./Connection";

// XXX on switch action -- switch to next window
// TODO handle on disconnect -- check if there is still a window
// if so then reinject the sdk and continue...

export class Server {
  /**
   * Manage connections with Client(s).
   */
  private _callbacks: any = {};
  private _httpServer: HttpServer;
  private _ioServer: SocketIO.Server;

  constructor(port: number = 3000) {
    this._httpServer = createServer();
    this._ioServer = SocketIO(this._httpServer);
    this._ioServer.on("connection", socket => this._onConnection(socket));
    this._httpServer.listen(port);
  }

  public async injectClient(browser: Browser): Promise<Connection> {
    await browser.injectSdk();

    const id = slug();
    const promise = this._registerCallback<Connection>(`connected_${id}`);

    const opts: ConnectOptions = { id, uri: CONFIG.wsUrl };

    await browser._browser!.execute(opts => {
      const qawolf: QAWolf = (window as any).qawolf;
      const client = new qawolf.Client();
      client.connect(opts);
    }, opts);

    return promise;
  }

  private _onConnection(socket: SocketIO.Socket) {
    const connection = new Connection(socket);

    (this._callbacks[`connected_${connection.id}`] || []).forEach(
      (callback: (connection: Connection) => void) => callback(connection)
    );

    this._callbacks[`connected_${connection.id}`] = [];
  }

  private _registerCallback<T>(name: string) {
    return new Promise<T>(resolve => {
      const callbacks = this._callbacks[name] || [];
      this._callbacks[name] = callbacks;
      callbacks.push(resolve);
    });
  }
}
