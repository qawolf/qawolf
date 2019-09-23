import io from "socket.io-client";
import { click, setInputValue } from "./actions";
import { waitForElement } from "./rank";
import { BrowserStep } from "../types";

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

export class Client {
  private _id: string;
  private _socket: SocketIOClient.Socket;
  private _RESPONSE_KEY: string;

  public connect({ id, uri }: ConnectOptions) {
    this._id = id;

    this._RESPONSE_KEY = `${this._id}_response`;

    this._socket = io(uri, {
      query: { id },
      rejectUnauthorized: false
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

  public async runStep(step: BrowserStep) {
    const element = (await waitForElement(step)) as HTMLElement;
    if (step.type === "click") {
      click(element);
    } else {
      setInputValue(element as HTMLInputElement, step.value);
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
    console.log("Client: response", response);
    sessionStorage.setItem(this._RESPONSE_KEY, response.id.toString());
    this._socket.emit("response", response);
  }

  private _shouldHandleRequest(request: Request) {
    let lastResponseId: any = sessionStorage.getItem(this._RESPONSE_KEY);
    lastResponseId = lastResponseId === null ? -1 : Number(lastResponseId);

    if (request.id <= lastResponseId) {
      // XXX store response until the next request is issued
      // prevent handling a request twice
      console.log(
        `Client: last response was ${lastResponseId}, ignoring old request:`,
        request
      );
      return false;
    }

    if (request.id - lastResponseId > 1) {
      throw new Error(
        `Last response was ${lastResponseId}. This request ${request.id} is out of order`
      );
    }

    return true;
  }
}
