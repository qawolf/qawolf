import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext } from "react";

import { EditorContext } from "../contexts/EditorContext";
import { MonacoBinding } from "../hooks/MonacoBinding";
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
    const binding = new MonacoBinding(
      monaco,
      helpersModel._content,
      editor.getModel(),
      new Set([editor]),
      helpersModel.awareness
    );

    editor.onDidDispose(() => binding.destroy());
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
