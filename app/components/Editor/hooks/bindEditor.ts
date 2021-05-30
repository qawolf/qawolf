import { useEffect, useState } from "react";

import { FileModel } from "../contexts/FileModel";
import { EditorDidMount, Monaco, MonacoEditor } from "../Sidebar/CodeEditor";
import { MonacoBinding } from "./MonacoBinding";

export const useBindEditor = (
  fileModel: FileModel
): ((options: EditorDidMount) => void) => {
  const [binding, setBinding] = useState<MonacoBinding>();
  const [isInitialized, setIsInitialized] = useState<boolean>();
  const [mountOptions, setMountOptions] = useState<EditorDidMount>();

  const editorDidMount = (options: EditorDidMount) => {
    setMountOptions(options);
    binding?.destroy();
    setBinding(null);
  };

  useEffect(() => fileModel?.bind<boolean>("isInitialized", setIsInitialized), [
    fileModel,
    setIsInitialized,
  ]);

  // before the document is initialized, bind the content manually
  // this will show the content in case we do not connect to the document server
  useEffect(() => {
    if (isInitialized || !mountOptions) return;

    return fileModel?.bind<string>("content", (content) => {
      mountOptions.editor.setValue(content);
    });
  }, [fileModel, isInitialized, mountOptions]);

  // after the document is initialized, bind to the document
  useEffect(() => {
    if (binding || !fileModel || !isInitialized || !mountOptions) return;

    const { editor, monaco } = mountOptions;

    const newBinding = new MonacoBinding(
      monaco,
      fileModel._content,
      editor.getModel(),
      new Set([editor]),
      fileModel._provider.awareness
    );
    setBinding(newBinding);
  }, [binding, fileModel, isInitialized, mountOptions]);

  return editorDidMount;
};
