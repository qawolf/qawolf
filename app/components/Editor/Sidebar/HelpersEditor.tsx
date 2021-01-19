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

type Editor = monacoEditor.editor.IStandaloneCodeEditor;

const DEBOUNCE_MS = 250;

export default function HelpersEditor(): JSX.Element {
  const { env } = useContext(RunnerContext);
  const { teamId } = useContext(StateContext);
  const { team } = useContext(TestContext);

  const [editor, setEditor] = useState<Editor | null>(null);
  const [monaco, setMonaco] = useState<typeof monacoEditor | null>(null);

  const [updateTeam] = useUpdateTeam();

  useEnvTypes({ env, monaco });

  const debouncedUpdateTeam = debounce(updateTeam, DEBOUNCE_MS);

  const editorDidMount = ({ editor, monaco }) => {
    setEditor(editor);
    setMonaco(monaco);
    includeTypes(monaco);

    editor.onDidChangeModelContent(() => {
      const helpers = editor.getValue();

      debouncedUpdateTeam({
        optimisticResponse: {
          updateTeam: { ...team, helpers },
        },
        variables: { helpers, id: teamId },
      });
    });
  };

  useEffect(() => {
    if (!editor) return;

    editor.setValue(team?.helpers || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, team?.id]);

  return <EditorComponent editorDidMount={editorDidMount} options={{}} />;
}
