import axios from "axios";
import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext, useEffect, useState } from "react";

import { RunnerContext } from "../../contexts/RunnerContext";
import { TestContext } from "../../contexts/TestContext";
import EditorComponent from "./Editor";
import { useEnvTypes } from "./hooks/envTypes";
import { useGlyphs } from "./hooks/glyphs";

type Editor = monacoEditor.editor.IStandaloneCodeEditor;

const TYPES_URL = "/types.txt";

const includeTypes = (monaco: typeof monacoEditor) => {
  axios.get(TYPES_URL).then(({ data: types }) => {
    const uri = monaco.Uri.file("qawolf/types.d.ts");
    if (monaco.editor.getModel(uri)) return;

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      types,
      uri.toString()
    );

    monaco.editor.createModel(types, "typescript", uri);
  });
};

export default function CodeEditor(): JSX.Element {
  // code, env, onSelectionChange,
  const [editor, setEditor] = useState<Editor | null>(null);
  const [monaco, setMonaco] = useState<typeof monacoEditor | null>(null);

  const { env, progress, onSelectionChange } = useContext(RunnerContext);
  const { code, controller, hasWriteAccess } = useContext(TestContext);

  useEnvTypes({ env, monaco });
  useGlyphs({ code, editor, progress });

  const editorDidMount = ({ editor, monaco }) => {
    setEditor(editor);
    setMonaco(monaco);
    editor.onDidChangeCursorSelection(onSelectionChange);
    includeTypes(monaco);
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
      options={{
        readOnly: !hasWriteAccess,
      }}
    />
  );
}
