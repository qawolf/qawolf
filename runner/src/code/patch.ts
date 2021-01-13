import { repeat } from "lodash";

export const PATCH_HANDLE = "// 🐺 create code here";

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

export const patch = (code: string, patch: string): string => {
  if (!code.includes(PATCH_HANDLE)) {
    throw new Error("Cannot patch without handle");
  }

  const numSpaces = getIndentation(code, PATCH_HANDLE);
  const indentedPatch = indent(patch, numSpaces, 1);

  const patchedCode = code.replace(PATCH_HANDLE, indentedPatch);
  return patchedCode;
};
