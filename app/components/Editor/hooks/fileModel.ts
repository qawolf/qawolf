import { useContext, useEffect, useRef, useState } from "react";

import { useFile } from "../../../hooks/queries";
import { state } from "../../../lib/state";
import { UserContext } from "../../UserContext";
import { FileModel } from "../contexts/FileModel";

export type FileState = {
  isDeleted: boolean;
  isInitialized: boolean;
  isLoaded: boolean;
  isReadOnly: boolean;
  path: string;
};

export type FileHook = {
  file: FileState;
  model: FileModel;
};

export const defaultFileState = {
  isDeleted: false,
  isInitialized: false,
  isLoaded: false,
  isReadOnly: true,
  path: "",
};

export const useFileModel = (id: string, createdAt: number): FileHook => {
  const { user } = useContext(UserContext);

  const modelRef = useRef<FileModel>();
  const [error, setError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [path, setPath] = useState("");
  const { data } = useFile({ id });
  const file = data?.file || null;

  useEffect(() => {
    modelRef.current = new FileModel();
    modelRef.current.bind("error", setError);
    modelRef.current.bind("is_initialized", setIsInitialized);
    modelRef.current.bind("path", setPath);
    return () => modelRef.current.dispose();
  }, []);

  useEffect(() => {
    if (!file) return;

    modelRef.current.setFile(file);
    setIsLoaded(true);
    setPath(file.path);
  }, [file]);

  useEffect(() => {
    if (!error) return;

    state.setToast({ error: true, expiresIn: 3000, message: error });
  }, [error]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    modelRef.current.setUserState(user, createdAt);
  }, [createdAt, isLoaded, user]);

  return {
    file: {
      isDeleted: file && file.is_deleted,
      isInitialized,
      isLoaded,
      isReadOnly: !file || file.is_read_only,
      path,
    },
    model: modelRef.current,
  };
};
