import { EventEmitter } from "events";
import { debounce } from "lodash";
import type { editor as editorNs } from "monaco-editor/esm/vs/editor/editor.api";

import { saveEditorMutation } from "../../../graphql/mutations";
import { editorQuery } from "../../../graphql/queries";
import { SaveEditorVariables } from "../../../hooks/mutations";
import { client } from "../../../lib/client";
import { Editor } from "../../../lib/types";
import { VersionedMap } from "../../../lib/VersionedMap";

export class EditorController extends EventEmitter {
  readonly _state = new VersionedMap();

  _branch: string;
  _helpersEditor: editorNs.IStandaloneCodeEditor;
  _saveCount = -1;
  _testEditor: editorNs.IStandaloneCodeEditor;
  _value: Editor;

  constructor() {
    super();

    // sync state to the editors
    this._state.on("changed", ({ key, value, sender }) => {
      if (key === "helpers_code" && this._helpersEditor) {
        const currentValue = this._helpersEditor.getValue();
        if (currentValue !== value) this._helpersEditor.setValue(value);
      } else if (key === "test_code" && this._testEditor) {
        const currentValue = this._testEditor.getValue();
        if (currentValue !== value) this._testEditor.setValue(value);
      }

      if (key === "save_count") {
        if (value > this._saveCount) {
          this._saveCount = value;
          this._reload();
        }

        // prevent change causing infinite save loop
        return;
      }

      this.emit("changed", { key, value });

      if (sender) this._autoSave();
    });
  }

  get code(): string {
    return this._state.get("test_code") || "";
  }

  get helpers(): string {
    return this._state.get("helpers_code") || "";
  }

  getChanges(): Partial<SaveEditorVariables> {
    if (this._value?.run) return null;

    const changes: Partial<SaveEditorVariables> = {};

    const name = this._value?.test.name;
    if (typeof name === "string" && this._state.get("name") !== name) {
      changes.name = this._state.get("name");
    }

    const path = this._value?.test.path;
    if (typeof path === "string" && this._state.get("path") !== path) {
      changes.path = this._state.get("path");
    }

    if (this._state.get("helpers_code") !== this._value?.helpers) {
      changes.helpers = this._state.get("helpers_code");
    }

    if (this._state.get("test_code") !== this._value?.test.code) {
      changes.code = this._state.get("test_code");
    }

    return Object.keys(changes).length ? changes : null;
  }

  async _reload(): Promise<void> {
    const run_id = this._value?.run?.id || null;
    const test_id = this._value?.test?.id || null;
    if (!run_id && !test_id) return;

    await client.query({
      fetchPolicy: "network-only",
      query: editorQuery,
      variables: { branch: this._branch, run_id, test_id },
    });
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
    if (this._branch) return;

    this.save();
  }, 100);

  async save(): Promise<void> {
    if (this._value?.run) return;

    const test_id = this._value?.test.id;
    if (!test_id) return;

    const changes = this.getChanges();
    if (!changes) return;

    await client.mutate({
      mutation: saveEditorMutation,
      variables: { ...changes, branch: this._branch, test_id },
    });

    this._saveCount += 1;
    this._state.set("save_count", this._saveCount);
  }

  setValue(value: Editor): void {
    this._value = value;

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

    this.emit("changed", {});
  }

  updateCode(code: string): void {
    this._state.set("test_code", code);
  }
}
