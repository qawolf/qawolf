import getPort from "get-port";
import { createServer, Server as HttpServer } from "http";
import SocketIO from "socket.io";
import { logger } from "../logger";

export class Server {
  private _httpServer: HttpServer;
  private _ioServer: SocketIO.Server;
  private _port: number | undefined;

  constructor() {
    this._httpServer = createServer();
    this._ioServer = SocketIO(this._httpServer);
  }

  public get port() {
    return this._port;
  }

  public async listen() {
    this._port = await getPort();
    this._httpServer.listen(this._port);
    logger.debug(`Server listening on port ${this._port}`);
  }

  public async onConnection(id: string): Promise<SocketIO.Socket> {
    return new Promise(resolve => {
      // XXX reject after timeout
      const connectionListener = (socket: SocketIO.Socket) => {
        if (socket.handshake.query.id !== id) return;

        emitter.removeListener("connection", connectionListener);
        resolve(socket);
      };

      const emitter = this._ioServer.on("connection", connectionListener);
    });
  }

  public close() {
    this._ioServer.close();
    this._httpServer.close();
  }
}
