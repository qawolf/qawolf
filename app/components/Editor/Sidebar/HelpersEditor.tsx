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
  const { helpers, helpersModel, test } = useContext(EditorContext);

  const editorDidMount = ({ editor, monaco }: EditorDidMount) => {
    const binding = new EditorBinding({ editor, model: helpersModel, monaco });

    editor.onDidDispose(() => binding.dispose());
  };

  const isReadOnly =
    helpers.isLoaded && test.isLoaded
      ? helpers.isReadOnly || test.isReadOnly
      : undefined;

  return (
    <EditorComponent
      a11yTitle="helpers code"
      editorDidMount={editorDidMount}
      isInitialized={helpers.isInitialized}
      isReadOnly={isReadOnly}
      isVisible={isVisible}
      onKeyDown={onKeyDown}
    />
  );
}
