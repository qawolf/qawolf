import Debug from "debug";
import { EventEmitter } from "events";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import ws from "ws";
import { TextOperation } from "../types";

const debug = Debug("qawolf:FileModel");

export class FileModel extends EventEmitter {
  _doc = new Y.Doc();
  _provider?: WebsocketProvider;
  _text = this._doc.getText("file.monaco");

  constructor() {
    super();
    this.connect();
  }

  connect(): void {
    // TODO provide connection details in connect
    this._provider = new WebsocketProvider(
      `ws://host.docker.internal:1234`,
      "test.ckp5ypiw40003653q1xc96ys7",
      this._doc,
      {
        params: { authorization: process.env.TEMP_AUTH! },
        WebSocketPolyfill: ws as any,
      }
    );
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
