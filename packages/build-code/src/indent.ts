import { last, repeat } from "lodash";

export const getIndentation = (stringValue: string, searchValue: string) => {
  const searchIndex = stringValue.indexOf(searchValue);
  if (searchIndex < 0) return 0;

  const codeBeforeInclusive = stringValue.substr(
    0,
    searchIndex + searchValue.length
  );

  const lines = codeBeforeInclusive.match(/[^\r\n]+/g);

  const codeLine = last(lines);
  if (!codeLine) return 0;

  return Math.max(codeLine.indexOf(searchValue), 0);
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
