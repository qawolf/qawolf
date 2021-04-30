import { useEffect, useState } from "react";

import { RunnerClient } from "../../../lib/runner";
import { EditorController } from "../contexts/EditorController";

export type RunnerHook = {
  editorController: EditorController | null;
  runner: RunnerClient | null;
  isRunnerConnected: boolean;
};

export const useRunner = (): RunnerHook => {
  const [connected, setConnected] = useState(false);
  const [runner, setRunner] = useState<RunnerClient>(null);

  // XXX move somewhere more appropriate and clean up interface
  const [editorController, setEditorController] = useState<EditorController>(
    null
  );

  useEffect(() => {
    const editorCtrl = new EditorController();
    setEditorController(editorCtrl);

    const client = new RunnerClient(editorCtrl._state);
    client.subscribe({ type: "code" });
    client.subscribe({ type: "editor" });
    client.subscribe({ type: "elementchooser" });
    client.subscribe({ type: "run" });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    client.on("connect", onConnect);
    client.on("disconnect", onDisconnect);
    setRunner(client);

    return () => {
      client.close();
      client.off("connect", onConnect);
      client.off("disconnect", onDisconnect);
      setRunner(null);
      setEditorController(null);
    };
  }, []);

  return {
    editorController,
    isRunnerConnected: connected,
    runner,
  };
};
