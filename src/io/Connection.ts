import { slug } from "cuid";
import { remove } from "lodash";
import { Browser } from "../Browser";
import { CONFIG } from "../config";
import { logger } from "../logger";
import { Server } from "./Server";
import { Request, Response } from "../web/Client";
import { BrowserAction } from "../types";

type ConstructorArgs = {
  browser: Browser;
  server: Server;
};

type InflightRequest = {
  request: Request;
  callback: (response: Response) => void;
};

export class Connection {
  /**
   * A connection to a QAWolf Client residing in a Browser window.
   **/

  private _browser: Browser;
  // a unique id for the connection we keep across reloads
  private _connectionId: string = slug();

  private _inflight: InflightRequest[] = [];

  // increment request ids to ensure order
  private _requestId: number = 0;

  private _server: Server;
  public _socket: SocketIO.Socket; // public for tests
  private _windowHandle: string;

  constructor({ browser, server }: ConstructorArgs) {
    this._browser = browser;
    this._server = server;
  }

  public async connect() {
    await this.disconnect();
    await this._createSocket();
    this._socket.on("disconnect", this._onDisconnect);
    this._socket.on("response", this._onResponse);
  }

  public async disconnect() {
    if (!this._socket) return;

    this._socket.removeListener("disconnect", this._onDisconnect);
    this._socket.removeListener("response", this._onResponse);
    await this._socket.disconnect();
  }

  public async request(name: string, ...args: any) {
    const id = this._requestId++;

    const request: Request = { id, name, args };

    const responsePromise = new Promise<Response>(resolve =>
      this._inflight.push({ request, callback: resolve })
    );

    logger.debug(`send request ${JSON.stringify(request)}`);

    this._socket.emit("request", request);

    const response = await responsePromise;
    return response.data;
  }

  public run(action: BrowserAction) {
    return this.request("run", action);
  }

  private async _createSocket() {
    /**
     * Switch to the window, inject the client/connect, and set the socket.
     */
    const socketPromise = this._server.onConnection(this._connectionId);

    if (this._windowHandle) {
      await this._browser._browser!.switchToWindow(this._windowHandle);
    } else {
      this._windowHandle = await this._browser._browser!.getWindowHandle();
    }

    await this._browser.injectSdk({
      id: this._connectionId,
      uri: CONFIG.wsUrl
    });

    this._socket = await socketPromise;
  }

  private _onDisconnect = async (reason: string) => {
    logger.debug(`disconnected ${reason}, attempting reconnect`);
    await this.connect();

    logger.debug(`resending ${JSON.stringify(this._inflight)}`);

    // resend inflight requests
    // TODO await them??
    this._inflight.forEach(i => this._socket.emit("request", i.request));
  };

  private _onResponse = (response: Response) => {
    logger.debug(`received response ${JSON.stringify(response)}`);
    const [inflight] = remove(
      this._inflight,
      i => i.request.id === response.id
    );
    inflight.callback(response);
  };
}
