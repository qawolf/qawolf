import { RunnerClient } from "../../../lib/runner";
import { Env, RunOptions } from "../../../lib/types";
import { Selection } from "./selection";

type RunTestOptions = {
  code: string;
  selection: Selection | null;
  test_id: string;
  version: number;
};

export type RunTest = (options: RunTestOptions) => void;

type UseRunTest = {
  env: Env | null;
  resetProgress: (code: string) => void;
  runner: RunnerClient | null;
  setIsRunnerPending: (isPending: boolean) => void;
};

export const useRunTest = ({
  env,
  resetProgress,
  runner,
  setIsRunnerPending,
}: UseRunTest): RunTest => {
  const runTest = async ({
    code,
    selection,
    test_id,
    version,
  }: RunTestOptions) => {
    resetProgress(code);
    setIsRunnerPending(true);

    const options: RunOptions = {
      code,
      env: env || {},
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

  return runTest;
};
