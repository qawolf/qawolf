import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

import { colors } from "./theme-new";

export const background = colors.gray10;

export const editorColors = {
  "editor.background": background,
  "editor.foreground": background,
  "editor.lineHighlightBackground": background,
  "editorLineNumber.foreground": colors.gray5,
  "editorSuggestWidget.background": background,
  "editorSuggestWidget.border": background,
  "editorSuggestWidget.foreground": colors.gray3,
  "editorSuggestWidget.highlightForeground": colors.codePurple,
  "editorSuggestWidget.selectedBackground": colors.gray8,
};

export const options: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 12,
  insertSpaces: true,
  lineHeight: 20,
  minimap: {
    enabled: false,
  },
  scrollBeyondLastLine: false,
  selectOnLineNumbers: true,
  tabSize: 2,
};

export const rules: monacoEditor.editor.ITokenThemeRule[] = [
  { token: "", background },
  { token: "", foreground: colors.gray3 },
  { token: "comment", fontStyle: "italic", foreground: colors.gray7 },
  { token: "constant", foreground: colors.codePink },
  {
    token: "meta.function-call",
    foreground: colors.codeCyan,
  },
  { token: "keyword", foreground: colors.codePurple },
  { token: "number", foreground: colors.codePink },
  { token: "string", foreground: colors.codePink },
  { token: "type", foreground: colors.codePurple },
  { token: "variable", foreground: colors.codePink },
];

export const theme: monacoEditor.editor.IStandaloneThemeData = {
  base: "vs-dark",
  colors: editorColors,
  inherit: true,
  rules,
};
