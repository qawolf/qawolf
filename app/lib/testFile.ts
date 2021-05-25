import { FileModel } from "../components/Editor/contexts/FileModel";
import { PATCH_HANDLE } from "./code";
import { Selection } from "./types";

export const insertSnippet = (file: FileModel, snippet: string): Selection => {
  // patch at the handle or the bottom if there is no patch handle
  const codeLines = file.content.split("\n");
  let patchLine = codeLines.findIndex((l) => l.includes(PATCH_HANDLE));
  if (patchLine < 0) patchLine = codeLines.length;

  // insert the snippet
  const snippetLines = snippet.split("\n");
  codeLines.splice(patchLine, 0, ...snippetLines);

  file.content = codeLines.join("\n");

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
  const includesHandle = file.content.includes(PATCH_HANDLE);
  if (includesHandle) {
    // replace up to one leading newline
    const regex = new RegExp(`\n?${PATCH_HANDLE}`, "g");
    file.content = file.content.replace(regex, "");
  } else {
    const lines = file.content.split("\n");
    const insertIndex = mouseLineNumber ? mouseLineNumber - 1 : lines.length;

    // if the selected line is empty, insert it there
    if (lines[insertIndex] === "") lines[insertIndex] = PATCH_HANDLE;
    // otherwise insert it after the line
    else lines.splice(insertIndex + 1, 0, PATCH_HANDLE);

    file.content = lines.join("\n");
  }
};
