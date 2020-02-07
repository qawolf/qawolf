import { getIndentation, indent, removeLinesIncluding } from "../format";

type PatchOptions = {
  code: string;
  patch: string;
};

export const PATCH_SYMBOL = "// 🐺 CREATE CODE HERE";

export const canPatch = (code: string) => {
  return code.includes(PATCH_SYMBOL);
};

export const indentPatch = (code: string, patch: string) => {
  /**
   * Match the indentation of the symbol.
   */
  const numSpaces = getIndentation(code, PATCH_SYMBOL);

  return indent(patch, numSpaces, 1);
};

export const patchCode = ({ code, patch }: PatchOptions) => {
  if (!canPatch(code)) {
    throw new Error("Code missing patch symbol");
  }

  const patchedCode = code.replace(PATCH_SYMBOL, indentPatch(code, patch));

  return patchedCode;
};

export const removePatchSymbol = (code: string) => {
  return removeLinesIncluding(code, PATCH_SYMBOL);
};
