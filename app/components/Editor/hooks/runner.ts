import { useEffect, useState } from "react";

import { RunnerClient } from "../../../lib/runner";

export type RunnerHook = {
  runner: RunnerClient | null;
  isRunnerConnected: boolean;
};

export const useRunner = (): RunnerHook => {
  const [connected, setConnected] = useState(false);
  const [runner, setRunner] = useState<RunnerClient>(null);

  useEffect(() => {
    const client = new RunnerClient();
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
    };
  }, []);

  return {
    isRunnerConnected: connected,
    runner,
  };
};
