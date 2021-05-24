import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext } from "react";

import { EditorContext } from "../contexts/EditorContext";
import { BindOptions } from "../contexts/FileModel";
import EditorComponent from "./Editor";

type Props = {
  isVisible: boolean;
  onKeyDown: (e: monacoEditor.IKeyboardEvent) => void;
};

export default function HelpersEditor({
  isVisible,
  onKeyDown,
}: Props): JSX.Element {
  const { helpersModel, isHelpersReadOnly } = useContext(EditorContext);

  const editorDidMount = (options: BindOptions) => {
    helpersModel.bindEditor(options);
  };

  return (
    <EditorComponent
      a11yTitle="helpers code"
      editorDidMount={editorDidMount}
      isVisible={isVisible}
      onKeyDown={onKeyDown}
      options={{ readOnly: isHelpersReadOnly }}
    />
  );
}
