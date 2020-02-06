import { buildStepsCode } from "../build";
import { getIndentation, indent, removeLinesIncluding } from "../format";

export const PATCH_SYMBOL = "// 🐺 CREATE CODE HERE";

export const buildPatch = () => {
  let patch = buildStepsCode({
    startIndex,
    steps,
    isTest
  });

  // include the symbol to replace later
  patch += PATCH_SYMBOL;

  return patch;
};

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

export const patchCode = ({ code, startIndex, steps, isTest }) => {
  let patch = buildPatch();

  patch = indentPatch(code, patch);

  const patchedCode = code.replace(PATCH_SYMBOL, patch);

  if (removeSymbol) {
    code = removeLinesIncluding(code, PATCH_SYMBOL);
  }

  return patchedCode;
};
