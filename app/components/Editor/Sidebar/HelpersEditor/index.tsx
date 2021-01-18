import debounce from "debounce";
import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext, useEffect, useState } from "react";

import { useUpdateTeam } from "../../../../hooks/mutations";
import { useTeam } from "../../../../hooks/queries";
import { StateContext } from "../../../StateContext";
import { includeTypes } from "../CodeEditor";
import EditorComponent from "../Editor";

type Editor = monacoEditor.editor.IStandaloneCodeEditor;

const DEBOUNCE_MS = 250;

export default function HelpersEditor(): JSX.Element {
  const { teamId } = useContext(StateContext);
  const [editor, setEditor] = useState<Editor | null>(null);

  const { data } = useTeam({ id: teamId });
  const [updateTeam] = useUpdateTeam();

  const debouncedUpdateTeam = debounce(updateTeam, DEBOUNCE_MS);

  const team = data?.team;

  const editorDidMount = ({ editor, monaco }) => {
    setEditor(editor);
    includeTypes(monaco);

    editor.onDidChangeModelContent(() => {
      debouncedUpdateTeam({
        variables: { helpers: editor.getValue(), id: teamId },
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
