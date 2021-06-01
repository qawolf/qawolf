import Debug from "debug";
import { EventEmitter } from "events";
import ws from "ws";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import { TextOperation } from "../types";

const debug = Debug("qawolf:FileModel");

type ConnectOptions = {
  authorization: string;
  id: string;
  url: string;
};

class WebSocketPolyfill extends ws {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(address: any, protocol: any, options: any) {
    super(address, protocol, options);

    this.on("error", () => {
      // listen to prevent unhandled exceptions
      // since WebsocketProvider does not do this
    });
  }
}

export class FileModel extends EventEmitter {
  _connected = false;
  _doc = new Y.Doc();
  _content = this._doc.getText("file.content");
  _provider?: WebsocketProvider;

  connect({ authorization, id, url }: ConnectOptions): void {
    // XXX create a separate authentication method for runners
    if (this._provider) return;

    const adjustedUrl = url.replace("localhost", "host.docker.internal");

    this._provider = new WebsocketProvider(adjustedUrl, id, this._doc, {
      params: { authorization },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      WebSocketPolyfill: WebSocketPolyfill as any,
    });
  }

  get content(): string {
    return this._content.toJSON();
  }

  update(operations: TextOperation[]): boolean {
    if (!operations.length) {
      debug(`skip update: no changes`);
      return false;
    }

    operations.forEach((op) => {
      if (op.type === "delete") this._content.delete(op.index, op.length);
      else if (op.type === "insert") this._content.insert(op.index, op.value);
    });

    return true;
  }
}
