import Debug from "debug";
import { EventEmitter } from "events";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import ws from "ws";
import { TextOperation } from "../types";

const debug = Debug("qawolf:FileModel");

type ConnectOptions = {
  authorization: string;
  id: string;
  url: string;
};

export class FileModel extends EventEmitter {
  _connected = false;
  _doc = new Y.Doc();
  _provider?: WebsocketProvider;
  _text = this._doc.getText("file.monaco");

  connect({ authorization, id, url }: ConnectOptions): void {
    // XXX create a separate authentication method for runners
    if (this._provider) return;

    const adjustedUrl = url.replace("localhost", "host.docker.internal");

    this._provider = new WebsocketProvider(adjustedUrl, id, this._doc, {
      params: { authorization },
      WebSocketPolyfill: ws as any,
    });
  }

  get content(): string {
    return this._text.toJSON();
  }

  update(operations: TextOperation[]): boolean {
    if (!operations.length) {
      debug(`skip update: no changes`);
      return false;
    }

    operations.forEach((op) => {
      if (op.type === "delete") this._text.delete(op.index, op.length);
      else if (op.type === "insert") this._text.insert(op.index, op.value);
    });

    return true;
  }
}
