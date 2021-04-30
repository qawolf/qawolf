import type { editor as editorNs } from "monaco-editor/esm/vs/editor/editor.api";

import { SaveEditorVariables } from "../../../hooks/mutations";
import { Editor } from "../../../lib/types";
import { VersionedMap } from "../../../lib/VersionedMap";

export class EditorController {
  readonly _state = new VersionedMap();

  _helpersEditor: editorNs.IStandaloneCodeEditor;
  _testEditor: editorNs.IStandaloneCodeEditor;

  constructor() {
    // sync state to the editors
    this._state.on("changed", ({ key, value }) => {
      if (key === "helpers_code" && this._helpersEditor) {
        const currentValue = this._helpersEditor.getValue();
        if (currentValue !== value) this._helpersEditor.setValue(value);
      } else if (key === "test_code" && this._testEditor) {
        const currentValue = this._testEditor.getValue();
        if (currentValue !== value) this._testEditor.setValue(value);
      }
    });
  }

  get code(): string {
    return this._state.get("test_code") || "";
  }

  get helpers(): string {
    return this._state.get("helpers_code") || "";
  }

  getChanges(): Partial<SaveEditorVariables> {
    const changes: Partial<SaveEditorVariables> = {};

    if (this._state.get("name") !== this._state.get("saved_name")) {
      changes.name = this._state.get("name");
    } else if (this._state.get("path") !== this._state.get("saved_path")) {
      changes.path = this._state.get("path");
    }

    if (
      this._state.get("helpers_code") !== this._state.get("saved_helpers_code")
    ) {
      changes.helpers = this._state.get("helpers_code");
    }

    if (this._state.get("test_code") !== this._state.get("saved_test_code")) {
      changes.code = this._state.get("test_code");
    }

    return Object.keys(changes).length ? changes : null;
  }

  setHelpersEditor(editor: editorNs.IStandaloneCodeEditor): void {
    this._helpersEditor = editor;

    const value = this._state.get("helpers_code");
    // hydrate with current value
    if (value !== undefined) editor.setValue(value);

    // update state when editor changes
    editor.onDidChangeModelContent(() => {
      this._state.set("helpers_code", editor.getValue());
    });
  }

  setTestEditor(editor: editorNs.IStandaloneCodeEditor): void {
    this._testEditor = editor;

    const value = this._state.get("test_code");
    // hydrate with current value
    if (value !== undefined) editor.setValue(value);

    // update state when editor changes
    editor.onDidChangeModelContent(() => {
      this._state.set("test_code", editor.getValue());
    });
  }

  setValue(value: Editor): void {
    // initialize test code
    if (this._state.get("name") === undefined) {
      this._state.set("name", value.test.name);
    }

    if (this._state.get("path") === undefined) {
      this._state.set("path", value.test.path);
    }

    // initialize helpers code
    if (this._state.get("helpers_code") === undefined) {
      this._state.set("helpers_code", value.helpers);
    }

    // initialize test code
    if (this._state.get("test_code") === undefined) {
      this._state.set("test_code", value.test.code);
    }

    this._state.set("saved_helpers_code", value.helpers);
    this._state.set("saved_name", value.test.name);
    this._state.set("saved_path", value.test.path);
    this._state.set("saved_test_code", value.test.code);
  }

  updateCode(code: string): void {
    this._state.set("test_code", code);
  }
}
