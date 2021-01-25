import { RunnerClient } from "../../../lib/runner";
import { Env, RunOptions } from "../../../lib/types";
import { Selection } from "./selection";

type RunTestOptions = {
  code: string;
  helpers?: string;
  selection: Selection | null;
  test_id: string;
  version: number;
};

export type RunTest = (options: RunTestOptions) => void;

type UseRunTest = {
  env: Env | null;
  resetProgress: (code: string) => void;
  resetRunPress: () => void;
  runner: RunnerClient | null;
};

export const useRunTest = ({
  env,
  resetProgress,
  resetRunPress,
  runner,
}: UseRunTest): RunTest => {
  const runTest = async ({
    code,
    helpers,
    selection,
    test_id,
    version,
  }: RunTestOptions) => {
    resetProgress(code);
    resetRunPress();

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

  return runTest;
};
