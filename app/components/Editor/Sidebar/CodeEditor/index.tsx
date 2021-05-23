import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect } from "react";
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

  const [testContent, setTestContent] = useState("");
  const [helpers, setHelpers] = useState("");
  const [readOnly, setReadOnly] = useState(true);

  const { env, progress, onSelectionChange } = useContext(RunnerContext);
  const { helpersModel, testModel } = useContext(EditorContext);

  useEnvTypes({ env, monaco });
  useHelpersTypes({ helpers, monaco });
  useGlyphs({ editor, progress, testContent });

  useEffect(() => helpersModel?.onChange("content", setHelpers), [testModel]);
  useEffect(() => testModel?.onChange("content", setTestContent), [testModel]);
  useEffect(() => testModel?.onChange("readOnly", setReadOnly), [testModel]);

  const editorDidMount = ({ editor, monaco }) => {
    testModel.bind({ editor, monaco });

    setEditor(editor);
    setMonaco(monaco);
    includeTypes(monaco);

    editor.onDidChangeCursorSelection(onSelectionChange);
  };

  return (
    <EditorComponent
      a11yTitle="test code"
      editorDidMount={editorDidMount}
      isVisible={isVisible}
      onKeyDown={onKeyDown}
      options={{ readOnly }}
    />
  );
}
