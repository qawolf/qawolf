import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext, useEffect, useState } from "react";

import { RunnerContext } from "../../contexts/RunnerContext";
import { TestContext } from "../../contexts/TestContext";
import EditorComponent from "../Editor";
import { includeTypes } from "../helpers";
import { useEnvTypes, useHelpersTypes } from "./hooks/envTypes";
import { useGlyphs } from "./hooks/glyphs";

type Editor = monacoEditor.editor.IStandaloneCodeEditor;

type Props = { onKeyDown: (e: monacoEditor.IKeyboardEvent) => void };

export default function CodeEditor({ onKeyDown }: Props): JSX.Element {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [monaco, setMonaco] = useState<typeof monacoEditor | null>(null);

  const { env, progress, onSelectionChange } = useContext(RunnerContext);
  const { code, controller, hasWriteAccess, team } = useContext(TestContext);

  useEnvTypes({ env, monaco });
  useHelpersTypes({ helpers: team?.helpers, monaco });
  // useGlyphs({ code, editor, progress });
  useGlyphs({
    code,
    editor,
    progress: { ...progress, current_line: 3, status: "fail" },
  });

  const editorDidMount = ({ editor, monaco }) => {
    setEditor(editor);
    setMonaco(monaco);
    includeTypes(monaco);

    editor.onDidChangeCursorSelection(onSelectionChange);
  };

  useEffect(() => {
    if (!controller || !editor) return;

    // set the initial editor code
    editor.setValue(controller.code);

    // update the editor when the controller code updates
    const onCodeUpdated = (value: string) => {
      if (value === editor.getValue()) return;

      editor.setValue(value);
    };
    controller.on("codeupdated", onCodeUpdated);

    // update the controller code when the editor updates
    editor.onDidChangeModelContent(() =>
      controller.updateCode(editor.getValue())
    );

    return () => {
      controller.off("codeupdated", onCodeUpdated);
    };
  }, [controller, editor]);

  return (
    <EditorComponent
      editorDidMount={editorDidMount}
      onKeyDown={onKeyDown}
      options={{
        readOnly: !hasWriteAccess,
      }}
    />
  );
}
