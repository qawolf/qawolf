import { useEffect, useState } from "react";

import { RunnerClient } from "../../../lib/runner";
import { state } from "../../../lib/state";
import { Env, RunOptions } from "../../../lib/types";
import { minutesFromNow } from "../../../shared/utils";
import { Selection } from "./selection";

type RunTestOptions = {
  code: string;
  helpers?: string;
  selection: Selection | null;
  test_id: string;
  version: number;
};

export type RunTest = {
  isRunnerPending: boolean;
  runTest: (options: RunTestOptions) => void;
};

type UseRunTest = {
  env: Env | null;
  resetProgress: (code: string) => void;
  runner: RunnerClient | null;
};

export const useRunTest = ({
  env,
  resetProgress,
  runner,
}: UseRunTest): RunTest => {
  const [lastRunPress, setLastRunPress] = useState<string | null>(
    state.pendingRun ? new Date().toISOString() : null
  );
  const [isRunnerPending, setIsRunnerPending] = useState(!!state.pendingRun);

  useEffect(() => {
    const interval = setInterval(() => {
      const isPending =
        !!state.pendingRun || lastRunPress >= minutesFromNow(-1);

      setIsRunnerPending(isPending);
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [lastRunPress]);

  const runTest = async ({
    code,
    helpers,
    selection,
    test_id,
    version,
  }: RunTestOptions) => {
    resetProgress(code);
    setLastRunPress(new Date().toISOString());

    const options: RunOptions = {
      code,
      env: env || {},
      helpers: helpers || "",
      restart: !selection || selection.startLine === 1,
      test_id,
      version,
    };

    if (selection) {
      options.end_line = selection.endLine;
      options.start_line = selection.startLine;
    }

    if (!runner) throw new Error("Runner should be constructed");

    runner.run(options);
  };

  return { isRunnerPending, runTest };
};
