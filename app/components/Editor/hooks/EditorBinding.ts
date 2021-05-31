import { FileModel } from "../contexts/FileModel";
import { EditorDidMount, Monaco, MonacoEditor } from "../Sidebar/CodeEditor";
import { MonacoBinding } from "./MonacoBinding";

type ConstructorOptions = EditorDidMount & {
  model: FileModel;
};

export class EditorBinding {
  _binding?: MonacoBinding;
  _editor: MonacoEditor;
  _model: FileModel;
  _monaco: Monaco;
  _unbindFile: () => void;

  constructor({ editor, model, monaco }: ConstructorOptions) {
    this._editor = editor;
    this._model = model;
    this._monaco = monaco;

    const disposeContent = this._model.bind("content", () => {
      if (this._model.is_initialized) return;

      this._editor.setValue(this._model.content);
    });

    const disposeIsInitialized = this._model.bind("is_initialized", () => {
      // set timeout to allow unbind to be set first
      setTimeout(() => this._bindToDocument(), 0);
    });

    this._unbindFile = () => {
      disposeContent();
      disposeIsInitialized();
    };
  }

  _bindToDocument(): void {
    if (this._binding || !this._model.is_initialized) return;

    this._unbindFile();

    this._binding = new MonacoBinding(
      this._monaco,
      this._model._content,
      this._editor.getModel(),
      new Set([this._editor]),
      this._model._provider.awareness
    );
  }

  dispose(): void {
    this._unbindFile();
    this._binding?.destroy();
  }
}
