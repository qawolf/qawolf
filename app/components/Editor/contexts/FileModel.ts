import { EventEmitter } from "events";
import type { editor as editorNs } from "monaco-editor/esm/vs/editor/editor.api";
import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { PATCH_HANDLE } from "../../../lib/code";

import { VersionedMap } from "../../../lib/VersionedMap";

type BindOptions = {
  editor: editorNs.IStandaloneCodeEditor;
  monaco: typeof monacoEditor;
};

type File = {
  content: string;
  deleted_at?: string;
  id: string;
  path: string;
};

export class FileModel extends EventEmitter {
  _contentKey?: string;
  _editor?: editorNs.IStandaloneCodeEditor;
  _file?: File;
  _state: VersionedMap;

  constructor(state: VersionedMap) {
    super();
    this._state = state;
  }

  bind({ editor }: BindOptions): void {
    this._editor = editor;

    // TODO handle on change & off

    this._state.on("changed", ({ key, value }) => {
      if (this._editor && key === this._contentKey) {
        const currentValue = this._editor.getValue();
        if (currentValue !== value) this._editor.setValue(value);
      }
    });
  }

  changes(): Partial<File> {
    const changes: Partial<File> = {};

    const { content, path } = this._file;

    if (this.content !== content) changes.content = this.content;
    if (this.path !== path) changes.path = this.path;

    return Object.keys(changes).length ? changes : null;
  }

  get content(): string {
    return this._state.get(this._contentKey) || "";
  }

  set content(value: string) {
    this._state.set("content", value);
  }

  get path(): string | undefined {
    return this._state.get("path") || this._file?.path;
  }

  set path(value: string) {
    this._state.set("path", value);
  }

  get readOnly(): boolean {
    return !!this._file?.deleted_at;
  }

  setFile(file: File): void {
    this._file = file;

    this._contentKey = file.path.includes("helpers")
      ? "helpers_code"
      : "test_code";
  }

  toggleCodeGeneration(mouseLineNumber?: number): void {
    const includesHandle = this.content.includes(PATCH_HANDLE);
    if (includesHandle) {
      // replace up to one leading newline
      const regex = new RegExp(`\n?${PATCH_HANDLE}`, "g");
      this.content.replace(regex, "");
    } else {
      const lines = this.content.split("\n");
      const insertIndex = mouseLineNumber ? mouseLineNumber - 1 : lines.length;

      // if the selected line is empty, insert it there
      if (lines[insertIndex] === "") lines[insertIndex] = PATCH_HANDLE;
      // otherwise insert it after the line
      else lines.splice(insertIndex + 1, 0, PATCH_HANDLE);

      this.content = lines.join("\n");
    }
  }
}
