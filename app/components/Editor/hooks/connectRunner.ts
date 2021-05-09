import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import { useRunner } from "../../../hooks/queries";
import { RunnerClient } from "../../../lib/runner";
import { StateContext } from "../../StateContext";

export type ConnectRunnerHook = {
  isRunnerLoading: boolean;
  vncUrl: string | null;
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
  const { branch } = useContext(StateContext);

  const { data: runnerResult, loading, startPolling, stopPolling } = useRunner(
    query.run_id
      ? { run_id: query.run_id as string }
      : {
          request_test_runner: requestTestRunner,
          test_branch: branch,
          test_id: query.test_id as string,
        }
  );

  // manually poll instead of passing pollInterval
  // to prevent a duplicate request
  useEffect(() => {
    if (loading) return;

    startPolling(isRunnerConnected ? 30 * 1000 : 5 * 1000);

    return () => stopPolling();
  }, [isRunnerConnected, loading, startPolling, stopPolling]);

  const vncUrl = runnerResult?.runner?.vnc_url || null;
  const wsUrl = runnerResult?.runner?.ws_url || null;

  // connect the runner to the ws url
  useEffect(() => {
    if (loading) return;

    runnerClient?.connect(wsUrl);
  }, [loading, runnerClient, wsUrl]);

  return { isRunnerLoading: loading, vncUrl, wsUrl };
};
