import debounce from "lodash/debounce";
import { useEffect, useRef, useState } from "react";

import { useUpdateFile } from "../../../hooks/mutations";
import { useFile } from "../../../hooks/queries";
import { VersionedMap } from "../../../lib/VersionedMap";
import { FileModel } from "../contexts/FileModel";

export type FileHook = {
  fileModel: FileModel;
  isLoaded: boolean;
  isReadOnly: boolean;
  path: string;
};

type UseFile = {
  autoSave: boolean;
  branch?: string;
  id: string;
  state: VersionedMap;
};

export const useFileModel = ({
  autoSave,
  branch,
  id,
  state,
}: UseFile): FileHook => {
  const modelRef = useRef<FileModel>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [path, setPath] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);

  const { data } = useFile({ branch, id });
  const file = data?.file || null;

  const [updateFile] = useUpdateFile();

  useEffect(() => {
    if (!state) return;

    modelRef.current = new FileModel(state);

    modelRef.current.bind("isReadOnly", setIsReadOnly);

    modelRef.current.bind("path", setPath);

    return () => modelRef.current.dispose();
  }, [state]);

  useEffect(() => {
    if (!file) return;

    modelRef.current.setFile(file);
    setIsLoaded(true);
    setPath(file.path);
  }, [file]);

  useEffect(() => {
    // listen for changes to save after the file is loaded
    if (!autoSave || !isLoaded || !updateFile) return;

    const fileModel = modelRef.current;

    const onChanged = debounce(() => {
      if (fileModel.isReadOnly) return;

      const changes = fileModel.changes();
      if (!changes) return;

      updateFile({ variables: { ...changes, id: fileModel.id } });
    }, 100);

    fileModel.on("changed", onChanged);

    return () => fileModel.off("changed", onChanged);
  }, [autoSave, branch, isLoaded, updateFile]);

  return { fileModel: modelRef.current, isLoaded, isReadOnly, path };
};
