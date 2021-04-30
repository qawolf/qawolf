import type { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { VersionedMap } from "../../../lib/VersionedMap";

// TODO just get helpers to work :)

export class EditorController {
  _helpersEditor: editor.IStandaloneCodeEditor;
  _state = new VersionedMap();

  constructor() {
    // sync state to the helpers editor
    this._state.on("changed", ({ key, value }) => {
      if (key === "helpers" && this._helpersEditor) {
        const currentValue = this._helpersEditor.getValue();
        if (currentValue !== value) this._helpersEditor.setValue(value);
      }
    });
  }

  // TODO set latest version of everything as well and share that

  initializeHelpers(value: string) {
    if (this._state.get("helpers") === undefined) {
      this._state.set("helpers", value);
    }
  }

  setHelpersEditor(editor: editor.IStandaloneCodeEditor) {
    this._helpersEditor = editor;

    const value = this._state.get("helpers");
    // hydrate with current value
    if (value !== undefined) editor.setValue(value);

    // update state when editor changes
    editor.onDidChangeModelContent(() => {
      this._state.set("helpers", editor.getValue());
    });
  }
}
