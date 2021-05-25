import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
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
  branch?: string;
  id: string;
  state: VersionedMap;
};

export const useFileModel = ({ branch, id, state }: UseFile): FileHook => {
  const modelRef = useRef<FileModel>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [path, setPath] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);

  const { data } = useFile({ branch, id });
  const file = data?.file || null;

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
    // do not autosave for git branches
    if (branch) return;

    // listen for changes to save after the file is loaded
    if (!isLoaded) return;

    const fileModel = modelRef.current;

    const onChanged = debounce(() => {
      if (fileModel.isReadOnly) return;

      console.log("todo updateFile mutation", fileModel.content);
    }, 100);

    fileModel.on("changed", onChanged);

    return () => fileModel.off("changed", onChanged);
  }, [branch, isLoaded]);

  return { fileModel: modelRef.current, isLoaded, isReadOnly, path };
};
