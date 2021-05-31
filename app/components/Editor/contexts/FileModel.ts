import { EventEmitter } from "events";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import { JWT_KEY } from "../../../lib/client";
import { File } from "../../../lib/types";

export class FileModel extends EventEmitter {
  _doc = new Y.Doc();
  _content = this._doc.getText("file.content");
  _file?: File;
  _metadata = this._doc.getMap("file.metadata");
  _provider?: WebsocketProvider;

  constructor() {
    super();

    this._content.observe(() => {
      this.emit("changed", { key: "content" });
    });

    this._metadata.observe(({ keysChanged }) => {
      keysChanged.forEach((key) => this.emit("changed", { key }));
    });
  }

  bind<T>(key: string, callback: (value: T) => void): () => void {
    const onChange = (event: { key: string }) => {
      if (event.key === key) callback(this[key]);
    };

    this.on("changed", onChange);

    callback(this[key]);

    return () => this.off("changed", onChange);
  }

  get content(): string {
    return this.is_initialized
      ? this._content.toJSON()
      : this._file?.content || "";
  }

  delete(index: number, length: number): void {
    this._content.delete(index, length);
  }

  dispose(): void {
    this._doc.destroy();
    this._provider?.destroy();
    this._provider = null;
    this.removeAllListeners();
  }

  get changed_keys(): string[] {
    const keys = this._metadata.get("changed_keys") || "";
    if (keys.length < 1) return [];

    return keys.split(",");
  }

  get id(): string | undefined {
    return this._file?.id;
  }

  get is_initialized(): boolean {
    return !!this._metadata.get("is_initialized");
  }

  insert(index: number, text: string): void {
    this._content.insert(index, text);
  }

  get is_read_only(): boolean {
    return this._file ? this._file.is_read_only : true;
  }

  get path(): string {
    return this._metadata.get("path") || this._file?.path || "";
  }

  set path(value: string) {
    this._metadata.set("path", value);
  }

  reload(): void {
    if (!this.is_initialized) return;

    this._metadata.set("reload_at", Date.now());
  }

  setFile(file: File): void {
    this._file = file;

    this.emit("changed", { key: "content" });
    this.emit("changed", { key: "is_read_only" });
    this.emit("changed", { key: "path" });

    this._provider?.destroy();

    this._provider = new WebsocketProvider(file.url, file.id, this._doc, {
      params: { authorization: localStorage.getItem(JWT_KEY) },
    });
  }
}
