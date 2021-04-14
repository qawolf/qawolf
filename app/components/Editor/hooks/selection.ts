import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useState } from "react";

export type Selection = {
  startLine: number;
  endLine: number;
};

type OnSelectionChange = (
  event: monacoEditor.editor.ICursorSelectionChangedEvent
) => void;

export type SelectionHook = {
  codeLine: number | null;
  helpersLine: number | null;
  mouseLineNumber: number | null;
  onCodeLineChange: OnSelectionChange;
  onHelpersLineChange: OnSelectionChange;
  onSelectionChange: OnSelectionChange;
  selection: Selection | null;
};

export const useSelection = (): SelectionHook => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [mouseLineNumber, setMouseLineNumber] = useState<number | null>(null);

  const [codeLine, setCodeLine] = useState<number | null>(null);
  const [helpersLine, setHelpersLine] = useState<number | null>(null);

  const onCodeLineChange = (
    event: monacoEditor.editor.ICursorSelectionChangedEvent
  ): void => {
    setCodeLine(event.selection.startLineNumber);
  };

  const onHelpersLineChange = (
    event: monacoEditor.editor.ICursorSelectionChangedEvent
  ): void => {
    setHelpersLine(event.selection.startLineNumber);
  };

  const onSelectionChange = (
    event: monacoEditor.editor.ICursorSelectionChangedEvent
  ): void => {
    const {
      endColumn,
      endLineNumber,
      startColumn,
      startLineNumber,
    } = event.selection;

    if (["keyboard", "mouse"].includes(event.source)) {
      setMouseLineNumber(startLineNumber);
    } else {
      // clear line number on other model changes
      setMouseLineNumber(null);
    }

    // selection is empty if it starts and ends the same place
    if (startColumn === endColumn && startLineNumber === endLineNumber) {
      setSelection(null);
      return;
    }

    setSelection({ endLine: endLineNumber, startLine: startLineNumber });
  };

  return {
    codeLine,
    helpersLine,
    mouseLineNumber,
    onCodeLineChange,
    onHelpersLineChange,
    onSelectionChange,
    selection,
  };
};
