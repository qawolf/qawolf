import { useEffect, useState } from "react";

import { EditorController } from "../contexts/EditorController";

type EditorControllerHook = {
  // TODO
  code: string;
  editorController: EditorController;
};

export const useEditorController = (): EditorControllerHook => {
  const [code, setCode] = useState<string>(null);
  const [editorController, setEditorController] = useState<EditorController>(
    null
  );

  useEffect(() => {
    const editorCtrl = new EditorController();
    setEditorController(editorCtrl);

    editorCtrl._state.on("changed", ({ value }) => setCode(value));

    return () => {
      setEditorController(null);
      editorCtrl._state.removeAllListeners();
    };
  }, []);

  return { code, editorController };
};
