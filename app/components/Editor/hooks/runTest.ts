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
  version: number;
};

export type RunTest = {
  runTest: (options: RunTestOptions) => void;
  shouldRequestRunner: boolean;
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
  const [shouldRequestRunner, setShouldRequestRunner] = useState(
    !state.pendingRun
  );
  const [ranAt, setRanAt] = useState<Date | null>(null);

  useEffect(() => {
    const interval = runAndSetInterval(() => {
      const value = !!state.pendingRun || ranAt >= new Date(minutesFromNow(-1));
      setShouldRequestRunner(value);
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [ranAt]);

  const runTest = async ({
    code,
    helpers,
    selection,
    test_id,
    version,
  }: RunTestOptions) => {
    resetProgress(code);
    setRanAt(new Date());

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

  return { runTest, shouldRequestRunner };
};
