import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useContext, useEffect, useState } from "react";

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
  const { helpersModel } = useContext(EditorContext);
  const [readOnly, setReadOnly] = useState(true);

  useEffect(() => helpersModel?.onChange("readOnly", setReadOnly), [
    helpersModel,
  ]);

  const editorDidMount = (options: BindOptions) => {
    helpersModel.bind(options);
  };

  return (
    <EditorComponent
      a11yTitle="helpers code"
      editorDidMount={editorDidMount}
      isVisible={isVisible}
      onKeyDown={onKeyDown}
      options={{ readOnly }}
    />
  );
}
