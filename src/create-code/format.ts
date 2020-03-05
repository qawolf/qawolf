import { repeat } from 'lodash';

export const getLineIncludes = (
  stringValue: string,
  searchValue: string,
): string | undefined => {
  return stringValue.split('\n').find(line => line.includes(searchValue));
};

export const getIndentation = (
  stringValue: string,
  searchValue: string,
): number => {
  const codeLine = getLineIncludes(stringValue, searchValue);
  if (!codeLine) return 0;

  return codeLine.indexOf(searchValue);
};

export const indent = (
  code: string,
  numSpaces: number,
  startLineIndex = 0,
): string => {
  const indent = repeat(' ', numSpaces);

  return code
    .split('\n')
    .map((line, index) => {
      if (index >= startLineIndex) return `${indent}${line}`;

      return line;
    })
    .join('\n');
};

export const removeLinesIncluding = (
  stringValue: string,
  searchValue: string,
): string => {
  return stringValue
    .split('\n')
    .filter(line => !line.includes(searchValue))
    .join('\n');
};
