import { Editor } from "../../../lib/types";
import type { editor as editorNs } from "monaco-editor/esm/vs/editor/editor.api";
import { VersionedMap } from "../../../lib/VersionedMap";

// TODO
// 2) sync saved state
// 3) set up save & auto-save
// 4) handle run special case

export class EditorController {
  _helpersEditor: editorNs.IStandaloneCodeEditor;
  _testEditor: editorNs.IStandaloneCodeEditor;
  _state = new VersionedMap();

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

  get code() {
    return this._state.get("test_code");
  }

  get helpers() {
    return this._state.get("helpers_code") || "";
  }

  setValue(value: Editor) {
    // initialize helpers code
    if (this._state.get("helpers_code") === undefined) {
      this._state.set("helpers_code", value.helpers);
    }

    // initialize test code
    if (this._state.get("test_code") === undefined) {
      this._state.set("test_code", value.test.code);
    }
  }

  setHelpersEditor(editor: editorNs.IStandaloneCodeEditor) {
    this._helpersEditor = editor;

    const value = this._state.get("helpers_code");
    // hydrate with current value
    if (value !== undefined) editor.setValue(value);

    // update state when editor changes
    editor.onDidChangeModelContent(() => {
      this._state.set("helpers_code", editor.getValue());
    });
  }

  setTestEditor(editor: editorNs.IStandaloneCodeEditor) {
    this._testEditor = editor;

    const value = this._state.get("test_code");
    // hydrate with current value
    if (value !== undefined) editor.setValue(value);

    // update state when editor changes
    editor.onDidChangeModelContent(() => {
      this._state.set("test_code", editor.getValue());
    });
  }

  updateCode(code: string) {
    this._state.set("test_code", code);
  }
}
