import { EventEmitter } from "events";
import type { editor as editorNs } from "monaco-editor/esm/vs/editor/editor.api";
import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

import { PATCH_HANDLE } from "../../../lib/code";
import { Selection } from "../../../lib/types";
import { VersionedMap } from "../../../lib/VersionedMap";

export type BindOptions = {
  editor: editorNs.IStandaloneCodeEditor;
  monaco: typeof monacoEditor;
};

type File = {
  content: string;
  id: string;
  is_read_only: boolean;
  path: string;
};

export class FileModel extends EventEmitter {
  _contentKey?: string;
  _editor?: editorNs.IStandaloneCodeEditor;
  _disposeHooks = [];
  _file?: File;
  _state: VersionedMap;

  constructor(state: VersionedMap) {
    super();

    this._state = state;

    this._state.on("changed", ({ key, value }) => {
      if (key === this._contentKey && this._editor) {
        const currentValue = this._editor.getValue();
        if (currentValue !== value) this._editor.setValue(value);
        this.emit("changed", { key: "content", value });
      } else if (key === "path") {
        this.emit("changed", { key, value });
      }
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

  bindEditor({ editor }: BindOptions): void {
    this._editor = editor;

    editor.setValue(this.content);

    const disposable = editor.onDidChangeModelContent(() => {
      this._state.set(this._contentKey, editor.getValue());
    });

    this._disposeHooks.push(() => disposable.dispose());
  }

  changes(): Partial<File> {
    const changes: Partial<File> = {};

    const { content, path } = this._file;

    if (this.content !== content) changes.content = this.content;
    if (this.path !== path) changes.path = this.path;

    return Object.keys(changes).length ? changes : null;
  }

  get content(): string {
    return this._state.get(this._contentKey) || this._file?.content || "";
  }

  set content(value: string) {
    this._state.set(this._contentKey, value);
  }

  dispose(): void {
    this.removeAllListeners();
    this._disposeHooks.forEach((dispose) => dispose());
    this._disposeHooks = [];
  }

  get isReadOnly(): boolean {
    return !!this._file?.is_read_only;
  }

  get path(): string | undefined {
    return this._state.get("path") || this._file?.path || "";
  }

  set path(value: string) {
    this._state.set("path", value);
  }

  setFile(file: File): void {
    this._file = file;

    this._contentKey = file.id.startsWith("helpers")
      ? "helpers_code"
      : "test_code";

    this.emit("changed", { key: "isReadOnly", value: this.isReadOnly });

    // use this.content since state might be set with a newer version
    const value = this.content;
    if (this._editor?.getValue() !== value) this._editor?.setValue(value);
  }

  // content helpers

  insertSnippet(snippet: string): Selection {
    // patch at the handle or the bottom if there is no patch handle
    const codeLines = this.content.split("\n");
    let patchLine = codeLines.findIndex((l) => l.includes(PATCH_HANDLE));
    if (patchLine < 0) patchLine = codeLines.length;

    // insert the snippet
    const snippetLines = snippet.split("\n");
    codeLines.splice(patchLine, 0, ...snippetLines);

    this.content = codeLines.join("\n");

    const selection = {
      startLine: patchLine + 1,
      endLine: patchLine + 1 + snippetLines.length,
    };

    return selection;
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
