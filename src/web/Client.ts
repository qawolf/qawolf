import io from "socket.io-client";
import { click, setInputValue } from "./actions";
import { BrowserAction } from "../types";

export type ConnectOptions = { id: string; uri: string };

export type Request = {
  id: number;
  name: string;
  args: any[];
};

export type Response = {
  id: number;
  data: any;
};

// XXX: onunload disconnect to ignore inflight requests

export class Client {
  private _id: string;
  private _socket: SocketIOClient.Socket;
  private _REQUEST_KEY: string;
  private _RESPONSE_KEY: string;

  public connect({ id, uri }: ConnectOptions) {
    this._id = id;

    this._REQUEST_KEY = `${this._id}_request`;
    this._RESPONSE_KEY = `${this._id}_response`;

    this._socket = io(uri, {
      query: { id }
    });

    this._socket.on("request", (request: Request) =>
      this._handleRequest(request)
    );

    return new Promise(resolve => {
      this._socket.on("connect", () => {
        console.log("Client: connected");
        resolve();
      });
    });
  }

  public run(action: BrowserAction): void {
    if (action.type === "click") {
      click(action.target.xpath);
    } else {
      setInputValue(action.target.xpath, action.value || "");
    }
  }

  public async version() {
    return "0.0.1";
  }

  private async _handleRequest(request: Request) {
    console.log("Client: request", request);
    if (!this._shouldHandleRequest(request)) return;

    const method = (this as any)[request.name];
    const data = await method(...request.args);

    const response: Response = { id: request.id, data };
    this._trackResponse(response);
    this._socket.emit("result", response);
  }

  private _shouldHandleRequest(request: Request) {
    let lastRequestId: any = sessionStorage.getItem(this._REQUEST_KEY);
    lastRequestId = lastRequestId === null ? -1 : Number(lastRequestId);

    let lastResponseId: any = sessionStorage.getItem(this._RESPONSE_KEY);
    lastResponseId = lastResponseId === null ? -1 : Number(lastResponseId);

    if (lastRequestId !== lastResponseId) {
      throw new Error(
        `Mismatch between last request ${lastRequestId} and response ${lastResponseId}`
      );
    }

    if (request.id <= lastRequestId) {
      // prevent handling a request twice
      console.log(
        `Client: last request was ${lastRequestId}, ignoring old request:`,
        request
      );
      return false;
    }

    if (request.id - lastRequestId > 1) {
      throw new Error(
        `Last request was ${lastRequestId}. This request ${request.id} is out of order`
      );
    }

    sessionStorage.setItem(this._REQUEST_KEY, request.id.toString());
    return true;
  }

  private async _trackResponse(response: Response) {
    console.log("Client: response", response);
    sessionStorage.setItem(this._RESPONSE_KEY, response.id.toString());
  }
}
