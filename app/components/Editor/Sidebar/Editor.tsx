import { monaco } from "@monaco-editor/react";
import { Box } from "grommet";
import { IKeyboardEvent } from "monaco-editor";
import React, { useEffect, useRef, useState } from "react";
import { AutoSizer } from "react-virtualized";

import {
  background,
  options as baseOptions,
  themeReadOnly,
  themeReadWrite,
} from "../../../theme/codeEditor";
import { EditorDidMount, Monaco, MonacoEditor } from "./CodeEditor";

const language = "javascript";

type InitializeOptions = {
  isReadOnly: boolean;
};

type Props = {
  a11yTitle?: string;
  editorDidMount: (options: EditorDidMount) => void;
  initializeOptions?: InitializeOptions;
  isVisible: boolean;
  onKeyDown: (e: IKeyboardEvent) => void;
};

export default function Editor({
  a11yTitle,
  editorDidMount,
  initializeOptions,
  isVisible,
  onKeyDown,
}: Props): JSX.Element {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isMonacoMounting, setIsMonacoMounting] = useState(true);
  const editorRef = useRef<MonacoEditor>();
  const monacoRef = useRef<Monaco>();
  const containerRef = useRef();

  useEffect(() => {
    const cancelable = monaco.init();

    cancelable
      .then(
        (monaco) => (monacoRef.current = monaco) && setIsMonacoMounting(false)
      )
      .catch(
        (error) =>
          error?.type !== "cancelation" &&
          console.error("Monaco initialization: error:", error)
      );

    return () => {
      editorRef.current
        ? editorRef.current.dispose()
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (cancelable as any).cancel();
    };
  }, []);

  useEffect(() => {
    if (!isEditorReady) return;

    const handler = editorRef.current.onKeyDown(onKeyDown);
    return () => handler.dispose();
  }, [isEditorReady, onKeyDown]);

  useEffect(() => {
    if (isMonacoMounting || isEditorReady || !initializeOptions) return;

    const { isReadOnly } = initializeOptions;

    function createEditor() {
      const monaco = monacoRef.current;

      const themeName = isReadOnly ? "qawolf-read" : "qawolf-read-write";
      monaco.editor.defineTheme(
        themeName,
        isReadOnly ? themeReadOnly : themeReadWrite
      );

      const editor = monaco.editor.create(containerRef.current, {
        ...baseOptions,
        automaticLayout: true,
        language,
        readOnly: isReadOnly,
        theme: themeName,
      });
      editorRef.current = editor;

      monaco.editor.setModelLanguage(editorRef.current.getModel(), language);

      editorRef.current.updateOptions({ readOnly: isReadOnly });

      setIsEditorReady(true);

      editorDidMount({ editor, monaco });
    }

    createEditor();
  }, [editorDidMount, initializeOptions, isMonacoMounting, isEditorReady]);

  const style = {
    height: isVisible ? "100%" : "0%",
    width: isVisible ? "100%" : "0%",
  };

  return (
    <Box aria-label={a11yTitle} background={background} fill style={style}>
      <AutoSizer>
        {({ height, width }) => (
          <div ref={containerRef} style={{ height, width }} />
        )}
      </AutoSizer>
    </Box>
  );
}
