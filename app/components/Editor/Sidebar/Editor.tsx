import { monaco } from "@monaco-editor/react";
import { Box } from "grommet";
import { editor, IKeyboardEvent } from "monaco-editor";
import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import React, { useEffect, useRef, useState } from "react";
import { AutoSizer } from "react-virtualized";

import {
  background,
  options as baseOptions,
  themeReadOnly,
  themeWrite,
} from "../../../theme/codeEditor";

const language = "javascript";

type EditorDidMount = {
  editor: editor.IStandaloneCodeEditor;
  monaco: typeof monacoEditor;
};

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
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<typeof monacoEditor>();
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

      const themeName = isReadOnly ? "qawolf-read" : "qawolf-write";
      monaco.editor.defineTheme(
        themeName,
        isReadOnly ? themeReadOnly : themeWrite
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
