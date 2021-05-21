import { useEffect, useRef } from "react";

import { Editor } from "../../../lib/types";
import { VersionedMap } from "../../../lib/VersionedMap";
import { FileModel } from "../contexts/FileModel";

export type FileHook = { fileModel: FileModel };

type UseFile = {
  editor: Editor;
  id: string;
  state: VersionedMap;
};

export const useFileModel = ({ editor, id, state }: UseFile): FileHook => {
  const fileModelRef = useRef(new FileModel(state));

  // TODO this should be a query instead
  useEffect(() => {
    if (!editor) return;

    const file = fileModelRef.current;

    const [type] = id.split(".");
    if (type === "helpers") {
      file.setFile({ content: editor?.helpers, id });
    } else if (type === "run") {
      file.setFile({
        content: editor.run.code,
        id,
        name: editor.test.name,
        path: editor.test.path,
      });
    } else if (type === "test") {
      const { code, name, path } = editor.test;
      file.setFile({ content: code, id, name, path });
    }
  }, [editor, fileModelRef, id]);

  return { fileModel: fileModelRef.current };
};
