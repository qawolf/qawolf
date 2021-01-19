import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

import { colors } from "./theme";

export const background = colors.black;

export const editorColors = {
  "editor.background": background,
  "editor.foreground": background,
  "editor.lineHighlightBackground": background,
  "editorLineNumber.foreground": "#53808B",
  "editorSuggestWidget.background": colors.black,
  "editorSuggestWidget.border": colors.black,
  "editorSuggestWidget.foreground": colors.white,
  "editorSuggestWidget.highlightForeground": colors.brand,
  "editorSuggestWidget.selectedBackground": colors.fadedBlue,
};

export const options: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  insertSpaces: true,
  minimap: {
    enabled: false,
  },
  scrollBeyondLastLine: false,
  selectOnLineNumbers: true,
  tabSize: 2,
};

export const rules: monacoEditor.editor.ITokenThemeRule[] = [
  { token: "", background },
  { token: "", foreground: colors.white },
  { token: "comment", fontStyle: "italic", foreground: colors.lightBrand },
  { token: "constant", foreground: colors.white },
  { token: "keyword", foreground: colors.brand },
  { token: "number", foreground: colors.editorPurple },
  { token: "string", foreground: colors.editorPurple },
  { token: "type", foreground: colors.brand },
  { token: "variable", foreground: colors.white },
];

export const theme: monacoEditor.editor.IStandaloneThemeData = {
  base: "vs-dark",
  colors: editorColors,
  inherit: true,
  rules,
};
