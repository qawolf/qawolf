import { getIndentation, indent, removeLinesIncluding } from "./format";

type PatchOptions = {
  code: string;
  patch: string;
};

export const PATCH_HANDLE = "// 🐺 CREATE CODE HERE";

export const canPatch = (code: string) => {
  return code.includes(PATCH_HANDLE);
};

export const indentPatch = (code: string, patch: string) => {
  /**
   * Match the indentation of the symbol.
   */
  const numSpaces = getIndentation(code, PATCH_HANDLE);

  return indent(patch, numSpaces, 1);
};

export const patchCode = ({ code, patch }: PatchOptions) => {
  if (!canPatch(code)) {
    throw new Error("Code missing patch symbol");
  }

  const patchedCode = code.replace(PATCH_HANDLE, indentPatch(code, patch));

  return patchedCode;
};

export const removePatchHandle = (code: string) => {
  return removeLinesIncluding(code, PATCH_HANDLE);
};
