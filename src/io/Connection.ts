import { slug } from "cuid";
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

  private _closed: boolean = false;

  // a unique id for the connection we keep across reloads
  private _connectionId: string = slug();

  private _inflight: InflightRequest | null = null;

  // increment request ids to ensure order
  private _requestId: number = 0;

  private _server: Server;
  public _socket: SocketIO.Socket | null; // public for tests
  private _windowHandle: string;

  constructor({ browser, server }: ConstructorArgs) {
    this._browser = browser;
    this._server = server;
  }

  public close() {
    logger.debug(`Connection ${this._connectionId}: close`);
    if (this._closed) return;

    this._closed = true;
    this._disconnect();
  }

  public async connect() {
    if (this._closed) {
      throw new Error("Cannot connect after closed");
    }

    this._disconnect();

    const socket = await this._createSocket();
    socket.on("disconnect", this._onDisconnect);
    socket.on("response", this._onResponse);

    return socket;
  }

  public async request(name: string, ...args: any) {
    if (this._inflight) {
      // only allow one request per Connection at a time to make retry logic easier
      throw new Error("Cannot send a request while one is inflight");
    }

    const id = this._requestId++;

    const request: Request = { id, name, args };

    const responsePromise = new Promise<Response>(resolve => {
      this._inflight = { request, callback: resolve };
    });

    logger.debug(
      `Connection ${this._connectionId}: send request ${JSON.stringify(
        request
      )}`
    );

    if (this._socket) {
      // if there is not a socket we will reconnect one
      this._socket.emit("request", request);
    }

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
    logger.debug(`Connection ${this._connectionId}: create socket`);

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

    const socket = await socketPromise;
    this._socket = socket;
    return socket;
  }

  private _disconnect() {
    if (!this._socket) return;

    this._socket.removeListener("disconnect", this._onDisconnect);
    this._socket.removeListener("response", this._onResponse);
    this._socket.disconnect(true);
    this._socket = null;
  }

  private _onDisconnect = async (reason: string) => {
    if (this._closed) return;

    logger.debug(
      `Connection ${this._connectionId}: reconnecting disconnected socket "${reason}"`
    );
    const socket = await this.connect();

    if (this._inflight) {
      logger.debug(
        `Connection ${this._connectionId}: resending ${JSON.stringify(
          this._inflight.request
        )} ${this._connectionId}`
      );
      socket.emit("request", this._inflight.request);
    }
  };

  private _onResponse = (response: Response) => {
    logger.debug(
      `Connection ${this._connectionId}: received response ${JSON.stringify(
        response
      )}`
    );

    const inflight = this._inflight;

    if (!inflight || response.id !== inflight.request.id) {
      throw new Error(
        `Response does not match inflight request ${JSON.stringify(
          this._inflight
        )}`
      );
    }

    this._inflight = null;
    inflight.callback(response);
  };
}
