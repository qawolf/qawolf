import { useEffect, useState } from "react";

import { EditorController } from "../contexts/EditorController";

type EditorControllerHook = {
  code: string;
  editorController: EditorController;
  hasChanges: boolean;
  name: string;
  path: string;
};

export const useEditorController = (): EditorControllerHook => {
  const [code, setCode] = useState<string>(null);
  const [editorController, setEditorController] = useState<EditorController>(
    null
  );
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [name, setName] = useState<string>(null);
  const [path, setPath] = useState<string>(null);

  useEffect(() => {
    const editorCtrl = new EditorController();
    setEditorController(editorCtrl);

    editorCtrl._state.on("changed", ({ key, value }) => {
      if (key === "test_code") {
        setCode(value);
      } else if (key === "name") {
        setName(value);
      } else if (key === "path") {
        setPath(value);
      }

      setHasChanges(!!editorCtrl.getChanges());
    });

    return () => {
      setEditorController(null);
      editorCtrl._state.removeAllListeners();
    };
  }, []);

  return { code, editorController, hasChanges, name, path };
};
