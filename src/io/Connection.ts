import { slug } from "cuid";
import { MethodMessage, ResultMessage } from "../web/Client";

export class Connection {
  private _callbacks: any = {};
  private _id: string;
  private _socket: SocketIO.Socket;

  constructor(socket: SocketIO.Socket) {
    this._id = socket.handshake.query.id;
    this._socket = socket;
    this._socket.on("result", message => this._onResult(message));
  }

  public get id() {
    return this._id;
  }

  public async method(name: string, ...args: any) {
    const id = slug();

    const promise = new Promise(resolve => {
      this._callbacks[id] = resolve;
    });

    const message: MethodMessage = { id, name, args };
    console.log("Emit method", message);

    this._socket.emit("method", message);

    return promise;
  }

  private _onResult(message: ResultMessage) {
    console.log("Received result", message);

    const { id, data } = message;
    this._callbacks[id](data);
    this._callbacks[id] = null;
  }
}
