import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import { useRunner } from "../../../hooks/queries";
import { RunnerClient } from "../../../lib/runner";
import { TestContext } from "../contexts/TestContext";

export type ConnectRunnerHook = {
  apiKey: string | null;
  wsUrl: string | null;
};

type UseConnectRunner = {
  isIdle: boolean;
  isRunnerConnected: boolean;
  runner: RunnerClient | null;
};

export const useConnectRunner = ({
  isIdle,
  isRunnerConnected,
  runner: runnerClient,
}: UseConnectRunner): ConnectRunnerHook => {
  const { query } = useRouter();

  const useLocalRunner = query.local === "1";
  const run_id = query.run_id as string;
  const test_id = query.test_id as string;

  const { isLatestCode } = useContext(TestContext);

  const { data: runnerResult, loading, startPolling, stopPolling } = useRunner(
    {
      run_id,
      should_request_runner: !isIdle,
      test_id,
    },
    {
      skip: !isLatestCode || useLocalRunner,
    }
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
    runnerClient?.connect({ apiKey, wsUrl });
  }, [apiKey, runnerClient, wsUrl]);

  return { apiKey, wsUrl };
};
