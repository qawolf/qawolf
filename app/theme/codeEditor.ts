import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

import { colors } from "./theme-new";

export const background = colors.gray10;

export const editorColors = {
  "editor.background": background,
  "editor.foreground": background,
  "editor.lineHighlightBackground": colors.gray9,
  "editor.selectionBackground": colors.codeHighlight,
  "editorCursor.foreground": colors.gray0,
  "editorLineNumber.foreground": colors.gray5,
  "editorSuggestWidget.background": background,
  "editorSuggestWidget.border": colors.gray9,
  "editorSuggestWidget.foreground": colors.gray3,
  "editorSuggestWidget.highlightForeground": colors.codePurple,
  "editorSuggestWidget.selectedBackground": colors.gray9,
  "editorWhitespace.foreground": colors.gray7,
  "editorWidget.background": background,
  "editorWidget.border": colors.gray9,
  "scrollbar.shadow": "#00000000", // transparent
};

export const options: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  insertSpaces: true,
  lineHeight: 24,
  minimap: {
    enabled: false,
  },
  scrollBeyondLastLine: false,
  selectOnLineNumbers: true,
  tabSize: 2,
};

export const rules: monacoEditor.editor.ITokenThemeRule[] = [
  { token: "", foreground: colors.gray3 },
  { token: "comment", fontStyle: "italic", foreground: colors.gray7 },
  { token: "constant", foreground: colors.codePink },
  { token: "delimiter.js", foreground: colors.codeBlue },
  { token: "keyword", foreground: colors.codePurple },
  { token: "number", foreground: colors.codePink },
  { token: "string", foreground: colors.codePink },
  { token: "type", foreground: colors.codePurple },
];

export const rulesReadOnly: monacoEditor.editor.ITokenThemeRule[] = [
  { token: "", foreground: colors.gray5 },
  { token: "comment", fontStyle: "italic", foreground: colors.gray7 },
  { token: "constant", foreground: colors.gray3 },
  { token: "delimiter.js", foreground: colors.gray3 },
  { token: "keyword", foreground: colors.gray3 },
  { token: "number", foreground: colors.gray3 },
  { token: "string", foreground: colors.gray3 },
  { token: "type", foreground: colors.gray3 },
];

export const theme: monacoEditor.editor.IStandaloneThemeData = {
  base: "vs-dark",
  colors: editorColors,
  inherit: true,
  rules,
};

export const themeReadOnly: monacoEditor.editor.IStandaloneThemeData = {
  base: "vs-dark",
  colors: editorColors,
  inherit: true,
  rules: rulesReadOnly,
};
