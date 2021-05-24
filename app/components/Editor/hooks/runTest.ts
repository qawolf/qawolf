import { useContext, useEffect, useState } from "react";

import { runAndSetInterval } from "../../../lib/helpers";
import { RunnerClient } from "../../../lib/runner";
import { state } from "../../../lib/state";
import { Env, RunOptions, Selection } from "../../../lib/types";
import { minutesFromNow } from "../../../shared/utils";
import { EditorContext } from "../contexts/EditorContext";

export type RunTest = {
  requestTestRunner: boolean;
  runTest: (selection?: Selection | null) => void;
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
  const { helpersModel, testModel } = useContext(EditorContext);

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

  const runTest = async (selection?: Selection) => {
    const testContent = testModel.content;

    resetProgress(testContent);
    setRanAt(new Date());

    const options: RunOptions = {
      code: testContent,
      env: env || {},
      helpers: helpersModel.content,
      restart: !selection || selection.startLine === 1,
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
