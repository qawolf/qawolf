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

    // bind to the content before the document is initialized
    const disposeContentBinding = this._model.bind("content", () => {
      if (this._model.is_initialized) return;

      this._editor.setValue(this._model.content);
    });

    // once the document is initialized bind to it
    const disposeIsInitializedBinding = this._model.bind<boolean>(
      "is_initialized",
      (is_initialized) => {
        if (!is_initialized) return;

        this._bindToDocument();
      }
    );

    this._unbindFile = () => {
      disposeContentBinding();
      disposeIsInitializedBinding();
    };
  }

  _bindToDocument(): void {
    if (this._binding || !this._model.awareness) return;

    this._unbindFile();

    this._binding = new MonacoBinding(
      this._monaco,
      this._model._content,
      this._editor.getModel(),
      new Set([this._editor]),
      this._model.awareness
    );
  }

  dispose(): void {
    this._unbindFile();
  }
}
