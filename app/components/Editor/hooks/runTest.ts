import { useEffect, useState } from "react";

import { runAndSetInterval } from "../../../lib/helpers";
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
};

export type RunTest = {
  requestTestRunner: boolean;
  runTest: (options: RunTestOptions) => void;
  stopTest: () => void;
};

type UseRunTest = {
  env: Env | null;
  resetProgress: (code: string | null) => void;
  runner: RunnerClient | null;
};

export const useRunTest = ({
  env,
  resetProgress,
  runner,
}: UseRunTest): RunTest => {
  const [requestTestRunner, setRequestTestRunner] = useState(
    !!state.pendingRun
  );
  const [ranAt, setRanAt] = useState<Date | null>(null);

  useEffect(() => {
    // request a test runner when there is a pending run
    // or "Run Test" was pressed recently
    const interval = runAndSetInterval(() => {
      const value = !!state.pendingRun || ranAt >= new Date(minutesFromNow(-1));
      setRequestTestRunner(value);
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [ranAt]);

  const runTest = async ({
    code,
    helpers,
    selection,
    test_id,
  }: RunTestOptions) => {
    resetProgress(code);
    setRanAt(new Date());

    const options: RunOptions = {
      code,
      env: env || {},
      helpers: helpers || "",
      restart: !selection || selection.startLine === 1,
      test_id,
    };

    if (selection) {
      options.end_line = selection.endLine;
      options.start_line = selection.startLine;
    }

    if (!runner) throw new Error("Runner should be constructed");

    runner.run(options);
  };

  const stopTest = () => {
    resetProgress(null);
    runner.stop();
  };

  return { requestTestRunner, runTest, stopTest };
};
