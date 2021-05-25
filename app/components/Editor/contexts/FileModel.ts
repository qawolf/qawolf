import { EventEmitter } from "events";
import type { editor as editorNs } from "monaco-editor/esm/vs/editor/editor.api";
import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import { MonacoBinding } from "../hooks/MonacoBinding";
import { File } from "../../../lib/types";
import { JWT_KEY } from "../../../lib/client";

export type BindOptions = {
  editor: editorNs.IStandaloneCodeEditor;
  monaco: typeof monacoEditor;
};

export class FileModel extends EventEmitter {
  _contentKey?: string;
  _disposeHooks = [];
  _doc = new Y.Doc();
  _editorBinding: any;
  _editor?: editorNs.IStandaloneCodeEditor;
  _file?: File;
  _fileMap = this._doc.getMap("file");
  _provider?: WebsocketProvider;
  _text = this._doc.getText("file.monaco");

  constructor() {
    super();

    this._text.observe(() => {
      this.emit("changed", { key: "content", value: this.content });
    });

    this._fileMap.observe(() => {
      this.emit("changed", { key: "path", value: this.path });
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

  bindEditor({ editor, monaco }: BindOptions): void {
    this._editor = editor;

    this._editorBinding?.destroy();

    this._editorBinding = new MonacoBinding(
      monaco,
      this._text,
      this._editor.getModel(),
      new Set([this._editor]),
      this._provider.awareness
    );
  }

  get content(): string {
    return this._text.toJSON();
  }

  delete(index: number, length: number): void {
    this._text.delete(index, length);
  }

  dispose(): void {
    this.removeAllListeners();
    this._editorBinding?.destroy();
    this._editorBinding = null;
  }

  get id(): string | undefined {
    return this._file?.id;
  }

  insert(index: number, text: string): void {
    this._doc.getText("file.monaco").insert(index, text);
  }

  get isReadOnly(): boolean {
    return !!this._file?.is_read_only;
  }

  get path(): string {
    return this._fileMap.get("path") || this._file?.path || "";
  }

  set path(value: string) {
    this._fileMap.set("path", value);
  }

  setFile(file: File): void {
    this._file = file;

    this.emit("changed", { key: "content", value: this.content });
    this.emit("changed", { key: "path", value: this.path });
    this.emit("changed", { key: "isReadOnly", value: this.isReadOnly });

    // use this.content since state might be set with a newer version
    const value = this.content;
    if (this._editor?.getValue() !== value) this._editor?.setValue(value);

    this._provider?.destroy();

    this._provider = new WebsocketProvider(
      `${location.protocol === "http:" ? "ws:" : "wss:"}//localhost:1234`,
      this._file.id,
      this._doc,
      { params: { authorization: localStorage.getItem(JWT_KEY) } }
    );
  }
}
