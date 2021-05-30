import axios from "axios";
import { Monaco } from "./CodeEditor";

export const includeTypes = (monaco: Monaco): void => {
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
