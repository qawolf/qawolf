import { createServer, Server as HttpServer } from "http";
import SocketIO from "socket.io";

export class Server {
  private _httpServer: HttpServer;
  private _ioServer: SocketIO.Server;

  constructor(port: number = 3000) {
    this._httpServer = createServer();
    this._ioServer = SocketIO(this._httpServer);
    this._httpServer.listen(port);
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
}
