import { monaco } from "@monaco-editor/react";
import { Box } from "grommet";
import isNil from "lodash/isNil";
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

type Props = {
  a11yTitle?: string;
  editorDidMount: (options: EditorDidMount) => void;
  isInitialized: boolean;
  isReadOnly?: boolean;
  isVisible: boolean;
  onKeyDown: (e: IKeyboardEvent) => void;
};

export default function Editor({
  a11yTitle,
  editorDidMount,
  isInitialized,
  isReadOnly,
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
    if (isMonacoMounting || isEditorReady) return;

    function createEditor() {
      const monaco = monacoRef.current;

      monaco.editor.defineTheme("qawolf-read", themeReadOnly);
      monaco.editor.defineTheme("qawolf-read-write", themeReadWrite);

      const editor = monaco.editor.create(containerRef.current, {
        ...baseOptions,
        automaticLayout: true,
        language,
        readOnly: true,
        theme: "qawolf-read-write",
      });
      editorRef.current = editor;

      monaco.editor.setModelLanguage(editorRef.current.getModel(), language);

      setIsEditorReady(true);

      editorDidMount({ editor, monaco });
    }

    createEditor();
  }, [editorDidMount, isMonacoMounting, isEditorReady]);

  // bind keydown
  useEffect(() => {
    if (!isEditorReady) return;

    const handler = editorRef.current.onKeyDown(onKeyDown);
    return () => handler.dispose();
  }, [isEditorReady, onKeyDown]);

  // set theme
  useEffect(() => {
    if (!isEditorReady || isNil(isReadOnly)) return;

    const monaco = monacoRef.current;

    monaco.editor.setTheme(isReadOnly ? "qawolf-read" : "qawolf-read-write");
  }, [isEditorReady, isReadOnly]);

  // set read only
  useEffect(() => {
    if (!isEditorReady || isNil(isReadOnly)) return;

    const readOnly = isReadOnly || !isInitialized;
    editorRef.current.updateOptions({ readOnly });
  }, [isEditorReady, isInitialized, isReadOnly]);

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
