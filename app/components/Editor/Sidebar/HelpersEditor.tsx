import debounce from "debounce";
import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext, useEffect, useState } from "react";

import { useUpdateTeam } from "../../../hooks/mutations";
import { StateContext } from "../../StateContext";
import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";
import { useEnvTypes } from "./CodeEditor/hooks/envTypes";
import EditorComponent from "./Editor";
import { includeTypes } from "./helpers";

type Props = {
  isVisible: boolean;
  onKeyDown: (e: monacoEditor.IKeyboardEvent) => void;
};

type Editor = monacoEditor.editor.IStandaloneCodeEditor;

const DEBOUNCE_MS = 250;

export default function HelpersEditor({
  isVisible,
  onKeyDown,
}: Props): JSX.Element {
  const { env } = useContext(RunnerContext);
  const { teamId } = useContext(StateContext);
  const { hasWriteAccess, helpers, refetchHelpers, team } = useContext(
    TestContext
  );

  const [editor, setEditor] = useState<Editor | null>(null);
  const [monaco, setMonaco] = useState<typeof monacoEditor | null>(null);

  const [updateTeam] = useUpdateTeam();

  useEnvTypes({ env, monaco });

  useEffect(() => {
    if (refetchHelpers) refetchHelpers();
  }, [refetchHelpers]);

  useEffect(() => {
    if (!editor) return;

    const value = editor.getValue();
    const isChanged = value !== helpers;

    if (!value || isChanged) {
      editor.setValue(helpers);
    }
  }, [editor, helpers]);

  const debouncedUpdateTeam = debounce(updateTeam, DEBOUNCE_MS);

  const editorDidMount = ({ editor, monaco }) => {
    setEditor(editor);
    setMonaco(monaco);
    includeTypes(monaco);

    editor.onDidChangeModelContent(() => {
      const updatedHelpers = editor.getValue();
      if (helpers === updatedHelpers) return;

      debouncedUpdateTeam({
        optimisticResponse: {
          updateTeam: { ...team, helpers: updatedHelpers },
        },
        variables: { helpers: updatedHelpers, id: teamId },
      });
    });
  };

  return (
    <EditorComponent
      a11yTitle="helpers code"
      editorDidMount={editorDidMount}
      isVisible={isVisible}
      onKeyDown={onKeyDown}
      options={{
        readOnly: !hasWriteAccess,
      }}
    />
  );
}
