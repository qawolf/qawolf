import { getIndentation, indent, removeLinesIncluding } from './format';

type PatchOptions = {
  code: string;
  patchLines: string[];
  replaceLines: string[];
};

export const CREATE_HANDLE = 'qawolf.create()';

export const PATCH_HANDLE = '// 🐺 create code here';

export const canPatch = (code: string): boolean => {
  return code.includes(PATCH_HANDLE);
};

export const indentPatch = (code: string, patch: string): string => {
  /**
   * Match the indentation of the symbol.
   */
  const numSpaces = getIndentation(code, PATCH_HANDLE);

  return indent(patch, numSpaces, 1);
};

export const patchCode = ({ code, patchLines, replaceLines }: PatchOptions): string => {
  if (!canPatch(code)) {
    throw new Error('Cannot patch without handle');
  }

  const replaceLinesWithHandle = [...(replaceLines || []), PATCH_HANDLE];
  const indentedReplaceLines = indentPatch(code, replaceLinesWithHandle.join('\n'));

  const patchLinesWithHandle = [...(patchLines || []), PATCH_HANDLE];
  const indentedPatch = indentPatch(code, patchLinesWithHandle.join('\n'));

  return code.replace(indentedReplaceLines, indentedPatch);
};

export const removePatchHandle = (code: string): string => {
  return removeLinesIncluding(code, PATCH_HANDLE);
};
