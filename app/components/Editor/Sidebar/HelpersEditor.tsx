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
  onKeyDown: (e: monacoEditor.IKeyboardEvent) => void;
};

type Editor = monacoEditor.editor.IStandaloneCodeEditor;

const DEBOUNCE_MS = 250;

export default function HelpersEditor({ onKeyDown }: Props): JSX.Element {
  const { env } = useContext(RunnerContext);
  const { teamId } = useContext(StateContext);
  const { hasWriteAccess, team } = useContext(TestContext);

  const [editor, setEditor] = useState<Editor | null>(null);
  const [monaco, setMonaco] = useState<typeof monacoEditor | null>(null);

  const [updateTeam] = useUpdateTeam();

  useEnvTypes({ env, monaco });

  const debouncedUpdateTeam = debounce(updateTeam, DEBOUNCE_MS);
  const helpers_version = team.helpers_version + 1;

  const editorDidMount = ({ editor, monaco }) => {
    setEditor(editor);
    setMonaco(monaco);
    includeTypes(monaco);

    editor.onDidChangeModelContent(() => {
      if (!team) return; // do not overwrite if team not loaded
      console.log("ON CHANGE", helpers_version);

      const helpers = editor.getValue();
      if (helpers === team.helpers) return;

      debouncedUpdateTeam({
        optimisticResponse: {
          updateTeam: { ...team, helpers, helpers_version },
        },
        variables: { helpers, helpers_version, id: teamId },
      });
    });
  };

  useEffect(() => {
    if (!editor || !team) return;

    editor.setValue(team.helpers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, teamId]);

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
