import { monaco } from "@monaco-editor/react";
import { Box } from "grommet";
import { editor, IKeyboardEvent } from "monaco-editor";
import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import React, { useEffect, useRef, useState } from "react";
import { AutoSizer } from "react-virtualized";

import {
  background,
  options as baseOptions,
  theme,
  themeReadOnly,
} from "../../../theme/codeEditor";

const language = "javascript";

type EditorDidMount = {
  editor: editor.IStandaloneCodeEditor;
  monaco: typeof monacoEditor;
};

type Props = {
  editorDidMount: (options: EditorDidMount) => void;
  onKeyDown: (e: IKeyboardEvent) => void;
  options: editor.IEditorOptions & editor.IGlobalEditorOptions;
};

export default function Editor({
  editorDidMount,
  onKeyDown,
  options,
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

    editorRef.current.updateOptions(options);
  }, [options, isEditorReady]);

  useEffect(() => {
    if (!isEditorReady) return;

    const handler = editorRef.current.onKeyDown(onKeyDown);

    return () => {
      handler.dispose();
    };
  }, [isEditorReady, onKeyDown]);

  useEffect(() => {
    if (isMonacoMounting || isEditorReady) return;

    function createEditor() {
      const monaco = monacoRef.current;

      const editor = monaco.editor.create(containerRef.current, {
        automaticLayout: true,
        language,
        ...baseOptions,
        ...options,
      });

      editorRef.current = editor;

      monaco.editor.defineTheme(
        "qawolf",
        options.readOnly ? themeReadOnly : theme
      );
      monaco.editor.setTheme("qawolf");

      monaco.editor.setModelLanguage(editorRef.current.getModel(), language);

      setIsEditorReady(true);

      editorDidMount({ editor, monaco });
    }

    createEditor();
  }, [editorDidMount, isMonacoMounting, isEditorReady, options]);

  return (
    <Box background={background} data-test="code" fill pad={{ left: "16px" }}>
      <AutoSizer>
        {({ height, width }) => (
          <div ref={containerRef} style={{ height, width }} />
        )}
      </AutoSizer>
    </Box>
  );
}
