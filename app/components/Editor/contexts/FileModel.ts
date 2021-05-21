import { EventEmitter } from "events";
import type { editor as editorNs } from "monaco-editor/esm/vs/editor/editor.api";
import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

import { VersionedMap } from "../../../lib/VersionedMap";

type BindOptions = {
  editor: editorNs.IStandaloneCodeEditor;
  monaco: typeof monacoEditor;
};

type File = {
  content: string;
  deleted_at?: string;
  id: string;
  name?: string;
  path?: string;
};

export class FileModel extends EventEmitter {
  _contentKey?: string;
  _editor?: editorNs.IStandaloneCodeEditor;
  _file?: File;
  _state: VersionedMap;

  constructor(state: VersionedMap) {
    super();
    this._state = state;

    // bind to the editor
    this._state.on("changed", ({ key, value }) => {
      if (this._editor && key === this._contentKey) {
        const currentValue = this._editor.getValue();
        if (currentValue !== value) this._editor.setValue(value);
      }
    });
  }

  bind({ editor }: BindOptions): void {
    this._editor = editor;
  }

  changes(): Partial<File> {
    const changes: Partial<File> = {};

    const { content, name, path } = this._file;

    if (this.content !== content) changes.content = this.content;
    if (this.name !== name) changes.name = this.name;
    if (this.path !== path) changes.path = this.path;

    return Object.keys(changes).length ? changes : null;
  }

  get content(): string {
    return this._state.get(this._contentKey) || "";
  }

  get name(): string | undefined {
    return this._state.get("name");
  }

  set name(value: string) {
    this._state.set("name", value);
  }

  get path(): string | undefined {
    return this._state.get("path");
  }

  get readOnly(): boolean {
    return !!this._file?.deleted_at;
  }

  setFile(file: File): void {
    this._file = file;
    this._contentKey = file.name === "helpers" ? "helpers_code" : "test_code";
  }
}
