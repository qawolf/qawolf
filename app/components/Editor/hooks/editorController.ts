import { useEffect, useState } from "react";

import { EditorController } from "../contexts/EditorController";

type EditorControllerHook = {
  code: string;
  editorController: EditorController;
  hasChanges: boolean;
};

export const useEditorController = (): EditorControllerHook => {
  const [code, setCode] = useState<string>(null);
  const [editorController, setEditorController] = useState<EditorController>(
    null
  );
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    const editorCtrl = new EditorController();
    setEditorController(editorCtrl);

    editorCtrl._state.on("changed", ({ value }) => {
      setCode(value);
      setHasChanges(!!editorCtrl.getChanges());
    });

    return () => {
      setEditorController(null);
      editorCtrl._state.removeAllListeners();
    };
  }, []);

  // TODO set up save and auto-save

  return { code, editorController, hasChanges };
};
