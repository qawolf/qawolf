import { useEffect, useRef, useState } from "react";

import { useFile } from "../../../hooks/queries";
import { FileModel } from "../contexts/FileModel";

export type FileHook = {
  fileModel: FileModel;
  isLoaded: boolean;
  isReadOnly: boolean;
  path: string;
};

export const useFileModel = (id: string): FileHook => {
  const modelRef = useRef<FileModel>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [path, setPath] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const { data } = useFile({ id });
  const file = data?.file || null;

  useEffect(() => {
    modelRef.current = new FileModel();
    modelRef.current.bind("isReadOnly", setIsReadOnly);
    modelRef.current.bind("path", setPath);
    return () => modelRef.current.dispose();
  }, []);

  useEffect(() => {
    if (!file) return;

    modelRef.current.setFile(file);
    setIsLoaded(true);
    setPath(file.path);
  }, [file]);

  return { fileModel: modelRef.current, isLoaded, isReadOnly, path };
};
