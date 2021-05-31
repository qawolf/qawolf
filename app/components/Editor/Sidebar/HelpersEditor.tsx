import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext } from "react";

import { EditorContext } from "../contexts/EditorContext";
import { EditorBinding } from "../hooks/EditorBinding";
import { EditorDidMount } from "./CodeEditor";
import EditorComponent from "./Editor";

type Props = {
  isVisible: boolean;
  onKeyDown: (e: monacoEditor.IKeyboardEvent) => void;
};

export default function HelpersEditor({
  isVisible,
  onKeyDown,
}: Props): JSX.Element {
  const { helpersModel, isLoaded, isReadOnly } = useContext(EditorContext);

  const editorDidMount = ({ editor, monaco }: EditorDidMount) => {
    const binding = new EditorBinding({ editor, model: helpersModel, monaco });

    editor.onDidDispose(() => binding.dispose());
  };

  return (
    <EditorComponent
      a11yTitle="helpers code"
      editorDidMount={editorDidMount}
      initializeOptions={isLoaded ? { isReadOnly } : null}
      isVisible={isVisible}
      onKeyDown={onKeyDown}
    />
  );
}
