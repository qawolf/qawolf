import { repeat } from "lodash";

export const getLineIncludes = (
  stringValue: string,
  searchValue: string
): string | undefined => {
  return stringValue.split("\n").find(line => line.includes(searchValue));
};

export const getIndentation = (stringValue: string, searchValue: string) => {
  const codeLine = getLineIncludes(stringValue, searchValue);
  if (!codeLine) return 0;

  return Math.max(codeLine.indexOf(searchValue), 0);
};

export const removeLineIncludes = (
  stringValue: string,
  searchValue: string
) => {
  return stringValue
    .split("\n")
    .filter(line => !line.includes(searchValue))
    .join("\n");
};

export const indent = (
  code: string,
  numSpaces: number,
  startLineIndex: number = 0
) => {
  const indent = repeat(" ", numSpaces);

  return code
    .split("\n")
    .map((line, index) => {
      if (index >= startLineIndex) return `${indent}${line}`;

      return line;
    })
    .join("\n");
};
