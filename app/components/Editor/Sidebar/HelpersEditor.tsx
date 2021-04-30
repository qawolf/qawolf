import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext, useState } from "react";

import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";
import { useEnvTypes } from "./CodeEditor/hooks/envTypes";
import EditorComponent from "./Editor";
import { includeTypes } from "./helpers";

type Props = {
  isVisible: boolean;
  onKeyDown: (e: monacoEditor.IKeyboardEvent) => void;
};

export default function HelpersEditor({
  isVisible,
  onKeyDown,
}: Props): JSX.Element {
  const { env } = useContext(RunnerContext);
  const { controller, hasWriteAccess } = useContext(TestContext);

  const [monaco, setMonaco] = useState<typeof monacoEditor | null>(null);

  useEnvTypes({ env, monaco });

  const editorDidMount = ({ editor, monaco }) => {
    controller.setHelpersEditor(editor);
    setMonaco(monaco);
    includeTypes(monaco);
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
