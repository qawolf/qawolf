import { debounce } from "lodash";
import type { editor as editorNs } from "monaco-editor/esm/vs/editor/editor.api";

import { saveEditorMutation } from "../../../graphql/mutations";
import { SaveEditorVariables } from "../../../hooks/mutations";
import { client } from "../../../lib/client";
import { Editor, Run } from "../../../lib/types";
import { VersionedMap } from "../../../lib/VersionedMap";

export class EditorController {
  readonly _state = new VersionedMap();

  _branch: string;
  _helpersEditor: editorNs.IStandaloneCodeEditor;
  _run: Run;
  _testEditor: editorNs.IStandaloneCodeEditor;
  _testId: string;

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

      this._autoSave();
    });
  }

  get code(): string {
    return this._state.get("test_code") || "";
  }

  get helpers(): string {
    return this._state.get("helpers_code") || "";
  }

  getChanges(): Partial<SaveEditorVariables> {
    if (this._run) return null;

    const changes: Partial<SaveEditorVariables> = {};

    if (this._state.get("name") !== this._state.get("saved_name")) {
      changes.name = this._state.get("name");
    }

    if (this._state.get("path") !== this._state.get("saved_path")) {
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

  setBranch(branch: string): void {
    this._branch = branch;
  }

  setHelpersEditor(editor: editorNs.IStandaloneCodeEditor): void {
    this._helpersEditor = editor;

    // hydrate with current value
    const value = this._state.get("helpers_code");
    if (value !== undefined) editor.setValue(value);

    // update state when editor changes
    editor.onDidChangeModelContent(() => {
      this._state.set("helpers_code", editor.getValue());
    });
  }

  setTestEditor(editor: editorNs.IStandaloneCodeEditor): void {
    this._testEditor = editor;

    // hydrate with current value
    const value = this._state.get("test_code");
    if (value !== undefined) editor.setValue(value);

    // update state when editor changes
    editor.onDidChangeModelContent(() => {
      this._state.set("test_code", editor.getValue());
    });
  }

  _autoSave = debounce(() => {
    if (this._branch || this._run) return;

    const test_id = this._testId;
    if (!test_id) return;

    const changes = this.getChanges();
    if (!changes) return;

    client.mutate({
      mutation: saveEditorMutation,
      variables: { ...changes, test_id },
    });
  }, 100);

  setValue(value: Editor): void {
    this._run = value.run;
    this._testId = value.test.id;

    if (this._state.get("name") === undefined) {
      this._state.set("name", value.test.name);
    }

    if (this._state.get("path") === undefined) {
      this._state.set("path", value.test.path);
    }

    if (this._state.get("helpers_code") === undefined) {
      this._state.set("helpers_code", value.helpers);
    }

    if (value.run) {
      this._state.set("test_code", value.run.code);
    } else if (this._state.get("test_code") === undefined) {
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
