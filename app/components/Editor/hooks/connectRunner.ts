import { useRouter } from "next/router";
import { useEffect } from "react";

import { useRunner } from "../../../hooks/queries";
import { RunnerClient } from "../../../lib/runner";

export type ConnectRunnerHook = {
  apiKey: string | null;
  isRunnerLoading: boolean;
  wsUrl: string | null;
};

type UseConnectRunner = {
  isRunnerConnected: boolean;
  requestTestRunner: boolean;
  runner: RunnerClient | null;
};

export const useConnectRunner = ({
  isRunnerConnected,
  requestTestRunner,
  runner: runnerClient,
}: UseConnectRunner): ConnectRunnerHook => {
  const { query } = useRouter();

  const useLocalRunner = query.local === "1";

  const { data: runnerResult, loading, startPolling, stopPolling } = useRunner(
    query.run_id
      ? { run_id: query.run_id as string }
      : {
          request_test_runner: requestTestRunner,
          test_id: query.test_id as string,
        },
    { skip: useLocalRunner }
  );

  // manually poll instead of passing pollInterval
  // to prevent a duplicate request
  useEffect(() => {
    if (loading) return;

    startPolling(isRunnerConnected ? 30 * 1000 : 5 * 1000);

    return () => stopPolling();
  }, [isRunnerConnected, loading, startPolling, stopPolling]);

  let apiKey: string = null;
  let wsUrl: string = null;

  if (useLocalRunner) {
    wsUrl = "ws://localhost:26367/.qawolf";
  } else if (runnerResult) {
    apiKey = runnerResult?.runner?.api_key || null;
    wsUrl = runnerResult?.runner?.ws_url || null;
  }

  // connect the runner to the ws url
  useEffect(() => {
    if (loading) return;

    runnerClient?.connect({ apiKey, wsUrl });
  }, [apiKey, loading, runnerClient, wsUrl]);

  return { apiKey, isRunnerLoading: loading, wsUrl };
};
