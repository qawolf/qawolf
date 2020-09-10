import { getIndentation, indent, removeLinesIncluding } from './format';

type PatchOptions = {
  code: string;
  patch: string;
};

export const CREATE_HANDLE = 'qawolf.create(';

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

export const patchCode = ({ code, patch }: PatchOptions): string => {
  if (!canPatch(code)) {
    throw new Error('Cannot patch without handle');
  }

  const patchedCode = code.replace(PATCH_HANDLE, indentPatch(code, patch));
  return patchedCode;
};

export const removePatchHandle = (code: string): string => {
  return removeLinesIncluding(code, PATCH_HANDLE);
};
