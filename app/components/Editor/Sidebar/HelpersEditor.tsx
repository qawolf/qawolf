import debounce from "debounce";
import isNil from "lodash/isNil";
import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext, useEffect, useRef, useState } from "react";

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
  const { hasWriteAccess, refetchTeam, team } = useContext(TestContext);

  const helpersVersionRef = useRef(team?.helpers_version || -1);

  const [editor, setEditor] = useState<Editor | null>(null);
  const [monaco, setMonaco] = useState<typeof monacoEditor | null>(null);

  const [updateTeam] = useUpdateTeam();

  useEnvTypes({ env, monaco });

  useEffect(() => {
    if (refetchTeam) refetchTeam();
  }, [refetchTeam]);

  useEffect(() => {
    if (!editor || !team) return;

    if (team.helpers_version > helpersVersionRef.current) {
      editor.setValue(team.helpers);
    }
  }, [editor, team]);

  // update current team helpers version so it works in callback
  useEffect(() => {
    if (!isNil(team?.helpers_version)) {
      helpersVersionRef.current = team.helpers_version;
    }
  }, [team?.helpers_version]);

  const debouncedUpdateTeam = debounce(updateTeam, DEBOUNCE_MS);

  const editorDidMount = ({ editor, monaco }) => {
    setEditor(editor);
    setMonaco(monaco);
    includeTypes(monaco);

    editor.onDidChangeModelContent(() => {
      const helpers = editor.getValue();
      if (!team || helpers === team.helpers) return;

      helpersVersionRef.current += 1;
      const helpers_version = helpersVersionRef.current;

      debouncedUpdateTeam({
        optimisticResponse: {
          updateTeam: { ...team, helpers, helpers_version },
        },
        variables: { helpers, helpers_version, id: teamId },
      });
    });
  };

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
