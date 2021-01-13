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
  mouseLineNumber: number | null;
  onSelectionChange: OnSelectionChange;
  selection: Selection | null;
};

export const useSelection = (): SelectionHook => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [mouseLineNumber, setMouseLineNumber] = useState<number | null>(null);

  const onSelectionChange = (
    event: monacoEditor.editor.ICursorSelectionChangedEvent
  ) => {
    const {
      endColumn,
      endLineNumber,
      startColumn,
      startLineNumber,
    } = event.selection;

    // model changes are caused when clicking o
    if (event.source !== "model") {
      setMouseLineNumber(endLineNumber);
    }

    // selection is empty if it starts and ends the same place
    if (startColumn === endColumn && startLineNumber === endLineNumber) {
      setSelection(null);
      return;
    }

    setSelection({ endLine: endLineNumber, startLine: startLineNumber });
  };

  return { mouseLineNumber, onSelectionChange, selection };
};
