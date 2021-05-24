import { useEffect, useRef } from "react";

import { debounce } from "lodash";

import { Editor } from "../../../lib/types";
import { VersionedMap } from "../../../lib/VersionedMap";
import { FileModel } from "../contexts/FileModel";

export type FileHook = { fileModel: FileModel };

type UseFile = {
  autoSave: boolean;
  editor: Editor;
  id: string;
  state: VersionedMap;
};

export const useFileModel = ({
  autoSave,
  editor,
  id,
  state,
}: UseFile): FileHook => {
  const fileModelRef = useRef(new FileModel(state));

  useEffect(() => {
    const fileModel = fileModelRef.current;
    if (!autoSave || !fileModel) return;

    const onChanged = debounce(() => {
      if (fileModel.readOnly) return;

      console.log("todo updateFile mutation");
    }, 100);

    fileModel.on("changed", onChanged);

    return () => fileModel.off("changed", onChanged);
  }, [autoSave]);

  // TODO this should be a query instead
  useEffect(() => {
    if (!editor) return;

    const file = fileModelRef.current;

    const [type] = id.split(".");
    if (type === "helpers") {
      file.setFile({ content: editor?.helpers, id, path: "helpers" });
    } else if (type === "run") {
      file.setFile({
        content: editor.run.code,
        id,
        path: editor.test.path || editor.test.name,
      });
    } else if (type === "test") {
      const { code, name, path } = editor.test;
      file.setFile({ content: code, id, path: path || name });
    }
  }, [editor, fileModelRef, id]);

  return { fileModel: fileModelRef.current };
};
