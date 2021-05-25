import { FileModel } from "../components/Editor/contexts/FileModel";
import { PATCH_HANDLE } from "./code";
import { Selection } from "./types";

export const insertSnippet = (file: FileModel, snippet: string): Selection => {
  const lines = file.content.split("\n");

  let patchLine = lines.findIndex((l) => l.includes(PATCH_HANDLE));
  // patch at the bottom if there is no patch handle
  if (patchLine < 0) patchLine = lines.length;

  // insert the snippet
  const index = lines.splice(0, patchLine).join("").length;
  file.insert(index, snippet);

  const snippetLines = snippet.split("\n");
  const selection = {
    startLine: patchLine + 1,
    endLine: patchLine + 1 + snippetLines.length,
  };

  return selection;
};

export const toggleCodeGeneration = (
  file: FileModel,
  mouseLineNumber?: number
): void => {
  const code = file.content;

  // match up to one leading newline
  const patchMatch = new RegExp(`\n?${PATCH_HANDLE}`, "g").exec(code);
  if (patchMatch) {
    // delete the patch handle
    file.delete(patchMatch.index, patchMatch[0].length);
  } else {
    let patch = PATCH_HANDLE;

    // insert the patch handle
    const lines = code.split("\n");

    // if mouse line number is provided make it 0-indexed
    // otherwise choose the last line
    let patchLine =
      mouseLineNumber > 0 ? mouseLineNumber - 1 : lines.length - 1;

    // prepend a line break, except on empty lines
    if (lines[patchLine] !== "") patch = "\n" + patch;

    // insert the patch after the line content
    let index = lines.slice(0, patchLine + 1).join().length;

    file.insert(index, patch);
  }
};
