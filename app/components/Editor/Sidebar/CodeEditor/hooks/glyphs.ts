import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect, useRef, useState } from "react";

import { RunProgress, RunStatus } from "../../../../../lib/types";
import { FileModel } from "../../../contexts/FileModel";
import styles from "../CodeEditor.module.css";

type GetGlyphs = {
  currentLine: number | null;
  readOnly: boolean;
  startLine: number | null;
  status: RunStatus | null;
};

type Glyph = monacoEditor.editor.IModelDeltaDecoration;

const COLUMN = 1;

const INTERVAL_MS = 100;

const getGlyphClass = (status: RunStatus, readOnly: boolean): string => {
  if (status === "created") return styles.glyphInProgress;
  if (readOnly && status === "fail") return styles.glyphFailReadOnly;
  if (status === "fail") return styles.glyphFail;
  if (readOnly) return styles.glyphPassReadOnly;

  return styles.glyphPass;
};

const getGlyphs = ({
  currentLine,
  readOnly,
  startLine,
  status,
}: GetGlyphs): Glyph[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monacoEditor = (window as any).monaco;

  if (!currentLine || !status || !monacoEditor) return [];

  // glyph for the current line
  const glyphs: Glyph[] = [
    {
      range: new monacoEditor.Range(currentLine, COLUMN, currentLine, COLUMN),
      options: {
        marginClassName: getGlyphClass(status, readOnly),
      },
    },
  ];

  if (readOnly && status === "fail") {
    glyphs.push({
      range: new monacoEditor.Range(currentLine, COLUMN, currentLine, COLUMN),
      options: {
        className: styles.lineFailReadOnly,
        inlineClassName: styles.textFailReadOnly,
        isWholeLine: true,
      },
    });
  }

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
        marginClassName: readOnly ? styles.glyphPassReadOnly : styles.glyphPass,
      },
    });
  }

  return glyphs;
};

type UseGlyphs = {
  editor: monacoEditor.editor.IStandaloneCodeEditor | null;
  progress: RunProgress;
  testModel: FileModel;
};

export const useGlyphs = ({ editor, progress, testModel }: UseGlyphs): void => {
  const [testContent, setTestContent] = useState("");
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const glyphsRef = useRef<string[]>([]);

  useEffect(() => testModel?.bind("content", setTestContent), [testModel]);

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
    if (progress && progress.code !== testContent) {
      updateGlyphs([]);
      return;
    }

    const glyphs = getGlyphs({
      currentLine: progress?.current_line || null,
      readOnly: editor.getOption(72), // readOnly
      startLine: progress?.start_line || null,
      status: progress?.status || null,
    });

    updateGlyphs(glyphs);
  }, [editor, isEditorLoaded, progress, testContent]);
};
