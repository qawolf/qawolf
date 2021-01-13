import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect, useRef, useState } from "react";

import { RunProgress, RunStatus } from "../../../../../lib/types";
import styles from "../CodeEditor.module.css";

type GetGlyphs = {
  currentLine: number | null;
  startLine: number | null;
  status: RunStatus | null;
};

type Glyph = monacoEditor.editor.IModelDeltaDecoration;

const COLUMN = 1;

const INTERVAL_MS = 100;

const getGlyphClass = (status: RunStatus): string => {
  if (status === "created") return styles.glyphInProgress;
  if (status === "fail") return styles.glyphFail;
  return styles.glyphPass;
};

const getGlyphs = ({ currentLine, startLine, status }: GetGlyphs): Glyph[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monacoEditor = (window as any).monaco;

  if (!currentLine || !status || !monacoEditor) return [];

  // glyph for the current line
  const glyphs: Glyph[] = [
    {
      range: new monacoEditor.Range(currentLine, COLUMN, currentLine, COLUMN),
      options: {
        marginClassName: getGlyphClass(status),
      },
    },
  ];

  // glyphs for the previous lines
  // do not include if only running one line
  if ((startLine || 1) < currentLine) {
    glyphs.push({
      range: new monacoEditor.Range(
        startLine || 1,
        COLUMN,
        currentLine - 1,
        COLUMN
      ),
      options: {
        marginClassName: styles.glyphPass,
      },
    });
  }

  return glyphs;
};

type UseGlyphs = {
  code: string;
  editor: monacoEditor.editor.IStandaloneCodeEditor | null;
  progress: RunProgress;
};

export const useGlyphs = ({ code, editor, progress }: UseGlyphs): void => {
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const glyphsRef = useRef<string[]>([]);

  // wait until content set because editor mounts
  // before glyphs can be rendered
  // https://github.com/react-monaco-editor/react-monaco-editor/issues/150
  useEffect(() => {
    if (!editor) {
      setIsEditorLoaded(false);
      return;
    }

    const checkLoadedInterval = setInterval(() => {
      if (!editor.getValue().length) return;

      setIsEditorLoaded(true);
      clearInterval(checkLoadedInterval);
    }, INTERVAL_MS);

    return () => clearInterval(checkLoadedInterval);
  }, [editor]);

  useEffect(() => {
    if (!isEditorLoaded) return;

    const updateGlyphs = (glyphs: Glyph[]) => {
      if (!editor) return;

      const previousGlyphs = editor.deltaDecorations(glyphsRef.current, glyphs);

      glyphsRef.current = previousGlyphs;
    };

    // clear the glyphs when the progress is different than the code
    if (progress && progress.code !== code) {
      updateGlyphs([]);
      return;
    }

    const glyphs = getGlyphs({
      currentLine: progress?.current_line || null,
      startLine: progress?.start_line || null,
      status: progress?.status || null,
    });

    updateGlyphs(glyphs);
  }, [code, editor, isEditorLoaded, progress]);
};
