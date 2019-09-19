import io from "socket.io-client";
import { BrowserAction } from "../types";
import { click, setInputValue } from "./actions";

// TODO
// 1) listen for command(s)
// 2) resolve/reject after command(s) complete

export type ConnectOptions = { id: string; uri: string };

export type MethodMessage = {
  id: string;
  name: string;
  args: any[];
};

export type ResultMessage = {
  id: string;
  data: any;
};

export class Client {
  private _socket: SocketIOClient.Socket;

  public connect({ id, uri }: ConnectOptions) {
    this._socket = io(uri, {
      query: { id }
    });

    this._socket.on("method", (message: MethodMessage) =>
      this._onMethod(message)
    );

    return new Promise(resolve => {
      this._socket.on("connect", () => {
        console.log("Client: connected");
        resolve();
      });
    });
  }

  public run(actions: BrowserAction[]): void {
    actions.forEach(action => {
      if (action.type === "click") {
        click(action.target.xpath);
      } else {
        setInputValue(action.target.xpath, action.value || "");
      }
    });
  }

  private async _onMethod(message: MethodMessage) {
    console.log("Client: received method", message);
    const method = (this as any)[message.name];
    const data = await method(...message.args);

    const result: ResultMessage = { id: message.id, data };
    console.log("Client: emit result", result);
    this._socket.emit("result", result);
  }

  public async version() {
    return "0.0.1";
  }
}
