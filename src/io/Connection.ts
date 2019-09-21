import { slug } from "cuid";
import { Browser } from "../Browser";
import { CONFIG } from "../config";
import { Server } from "./Server";
import { MethodMessage, ResultMessage } from "../web/Client";

type ConstructorArgs = {
  browser: Browser;
  server: Server;
};

export class Connection {
  /**
   * A connection to a QAWolf Client residing in a Browser window.
   **/

  private _browser: Browser;
  // a unique id for the connection we keep across reloads
  private _id: string = slug();
  private _resultResolver: any = {};
  private _server: Server;
  public _socket: SocketIO.Socket;
  private _windowHandle: string;

  constructor({ browser, server }: ConstructorArgs) {
    this._browser = browser;
    this._server = server;
  }

  public async connect() {
    await this.disconnect();
    await this._createSocket();
    this._socket.on("disconnect", this._onDisconnect);
    this._socket.on("result", this._onResult);
  }

  public async disconnect() {
    if (!this._socket) return;

    this._socket.removeListener("disconnect", this._onDisconnect);
    this._socket.removeListener("result", this._onResult);
    await this._socket.disconnect();
  }

  public async method(name: string, ...args: any) {
    const id = slug();

    const promise = new Promise(resolve => {
      this._resultResolver[id] = resolve;
    });

    const message: MethodMessage = { id, name, args };
    console.log("Emit method", message);

    this._socket.emit("method", message);

    return promise;
  }

  private async _createSocket() {
    /**
     * Switch to the window, inject the client/connect, and set the socket.
     */
    const socketPromise = this._server.onConnection(this._id);

    if (this._windowHandle) {
      await this._browser._browser!.switchToWindow(this._windowHandle);
    } else {
      this._windowHandle = await this._browser._browser!.getWindowHandle();
    }

    await this._browser.injectSdk({ id: this._id, uri: CONFIG.wsUrl });

    this._socket = await socketPromise;
  }

  private _onDisconnect = (reason: string) => {
    console.log("TODO DISCONNECT LOGICS", reason);
  };

  private _onResult = (message: ResultMessage) => {
    console.log("Received result", message);

    const { id, data } = message;
    this._resultResolver[id](data);
    this._resultResolver[id] = null;
  };
}
