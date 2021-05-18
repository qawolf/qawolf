import { repeat } from "lodash";

import { TextOperation } from "../types";

export const PATCH_HANDLE = "// 🐺 QA Wolf will create code here";

export const getIndentation = (
  stringValue: string,
  searchValue: string
): number => {
  const codeLine = stringValue
    .split("\n")
    .find((line) => line.includes(searchValue));
  if (!codeLine) return 0;

  return codeLine.indexOf(searchValue);
};

export const indent = (
  code: string,
  numSpaces: number,
  startLineIndex = 0
): string => {
  const indent = repeat(" ", numSpaces);

  return code
    .split("\n")
    .map((line, index) => {
      if (index >= startLineIndex) return `${indent}${line}`;

      return line;
    })
    .join("\n");
};

export const insertBeforeHandle = (
  code: string,
  patch: string
): TextOperation[] => {
  const index = code.indexOf(PATCH_HANDLE);
  if (index < 0) return [];

  const numSpaces = getIndentation(code, PATCH_HANDLE);
  const indentedPatch = indent(patch, numSpaces, 1);
  return [{ index, type: "insert", value: indentedPatch }];
};
