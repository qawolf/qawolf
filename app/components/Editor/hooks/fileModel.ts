import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";

import { Editor } from "../../../lib/types";
import { VersionedMap } from "../../../lib/VersionedMap";
import { FileModel } from "../contexts/FileModel";

export type FileHook = {
  fileModel: FileModel;
  isReadOnly: boolean;
  path: string;
};

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
  const ref = useRef(new FileModel(state));
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [path, setPath] = useState("");

  useEffect(() => ref.current.bind("path", setPath), [ref]);

  useEffect(() => {
    if (!editor) return;

    const file = ref.current;

    const [type] = id.split(".");
    // TODO this should be a query instead
    if (type === "helpers") {
      file.setFile({
        content: editor?.helpers,
        id,
        is_read_only: false,
        path: "helpers",
      });
    } else if (type === "run") {
      file.setFile({
        content: editor.run.code,
        id,
        is_read_only: true,
        path: editor.test.path || editor.test.name,
      });
    } else if (type === "test") {
      const { code, deleted_at, name, path } = editor.test;
      file.setFile({
        content: code,
        id,
        is_read_only: !!deleted_at,
        path: path || name,
      });
    }

    setIsReadOnly(file.isReadOnly);
    setPath(file.path);

    // listen for changes to save after the file is loaded
    if (autoSave) {
      const onChanged = debounce(() => {
        if (file.isReadOnly) return;

        console.log("todo updateFile mutation", file.content);
      }, 100);

      file.on("changed", onChanged);

      return () => file.off("changed", onChanged);
    }
  }, [autoSave, editor, ref, id]);

  return { fileModel: ref.current, isReadOnly, path };
};