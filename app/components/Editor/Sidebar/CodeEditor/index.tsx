import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext, useState } from "react";

import { EditorContext } from "../../contexts/EditorContext";
import { RunnerContext } from "../../contexts/RunnerContext";
import EditorComponent from "../Editor";
import { includeTypes } from "../helpers";
import { useEnvTypes, useHelpersTypes } from "./hooks/envTypes";
import { useGlyphs } from "./hooks/glyphs";

type Editor = monacoEditor.editor.IStandaloneCodeEditor;

type Props = {
  isVisible: boolean;
  onKeyDown: (e: monacoEditor.IKeyboardEvent) => void;
};

export default function CodeEditor({
  isVisible,
  onKeyDown,
}: Props): JSX.Element {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [monaco, setMonaco] = useState<typeof monacoEditor | null>(null);

  const { env, progress, onSelectionChange } = useContext(RunnerContext);
  const { helpersModel, isReadOnly, isLoaded, testModel } = useContext(
    EditorContext
  );

  useEnvTypes({ env, monaco });
  useHelpersTypes({ helpersModel, monaco });
  useGlyphs({ editor, progress, testModel });

  const editorDidMount = ({ editor, monaco }) => {
    testModel.bindEditor({ editor, monaco });

    setEditor(editor);
    setMonaco(monaco);
    includeTypes(monaco);

    editor.onDidChangeCursorSelection(onSelectionChange);
  };

  return (
    <EditorComponent
      a11yTitle="test code"
      editorDidMount={editorDidMount}
      initializeOptions={isLoaded ? { isReadOnly } : null}
      isVisible={isVisible}
      onKeyDown={onKeyDown}
    />
  );
}
