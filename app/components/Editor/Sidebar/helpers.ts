import axios from "axios";
import type monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

export const includeTypes = (monaco: typeof monacoEditor): void => {
  axios.get("/types.txt").then(({ data: types }) => {
    const uri = monaco.Uri.file("qawolf/types.d.ts");
    if (monaco.editor.getModel(uri)) return;

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      types,
      uri.toString()
    );

    monaco.editor.createModel(types, "typescript", uri);
  });
};
