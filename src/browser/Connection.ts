import { logger } from "../logger";
import { BrowserStep } from "../types";
import { Request, Response } from "../web/Client";

type InflightRequest = {
  request: Request;
  callback: (response: Response) => void;
};

export class Connection {
  /**
   * A connection to a QAWolf Client residing in a Browser window.
   **/

  private _id: string;

  // for pool to resend
  public _inflight: InflightRequest | null = null;

  // increment request ids to ensure order
  private _requestId: number = 0;

  // public for tests
  public _socket: SocketIO.Socket;

  private _windowHandle: string;

  constructor(socket: SocketIO.Socket, windowHandle: string) {
    this._id = socket.handshake.query.id;
    this._socket = socket;
    this._windowHandle = windowHandle;
    socket.on("response", this._onResponse);
  }

  public get id() {
    return this._id;
  }

  public get windowHandle() {
    return this._windowHandle;
  }

  public runStep(step: BrowserStep) {
    return this.request("runStep", step);
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
      `Connection ${this._id}: emit request ${JSON.stringify(request)}`
    );
    this._socket.emit("request", request);

    const { data } = await responsePromise;
    return data;
  }

  private _onResponse = (response: Response) => {
    logger.debug(
      `Connection ${this._id}: received response ${JSON.stringify(response)}`
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
