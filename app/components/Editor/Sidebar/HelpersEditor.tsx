import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext } from "react";

import { EditorContext } from "../contexts/EditorContext";
import { useBindEditor } from "../hooks/bindEditor";
import EditorComponent from "./Editor";

type Props = {
  isVisible: boolean;
  onKeyDown: (e: monacoEditor.IKeyboardEvent) => void;
};

export default function HelpersEditor({
  isVisible,
  onKeyDown,
}: Props): JSX.Element {
  const { helpersModel, isLoaded, isReadOnly } = useContext(EditorContext);

  const editorDidMount = useBindEditor(helpersModel);

  return (
    <EditorComponent
      a11yTitle="helpers code"
      editorDidMount={editorDidMount}
      initializeOptions={isLoaded ? { isReadOnly } : null}
      isVisible={isVisible}
      onKeyDown={onKeyDown}
    />
  );
}
