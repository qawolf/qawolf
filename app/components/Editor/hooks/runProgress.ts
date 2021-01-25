import * as Sentry from "@sentry/browser";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { RunnerClient } from "../../../lib/runner";
import { Run, RunProgress } from "../../../lib/types";

export type RunProgressHook = {
  progress: RunProgress | null;
  resetProgress: (code: string) => void;
};

type UseRunProgress = {
  run: Run | null;
  runner: RunnerClient | null;
};

export const useRunProgress = ({
  run,
  runner,
}: UseRunProgress): RunProgressHook => {
  const { query } = useRouter();

  const [progress, setProgress] = useState<RunProgress | null>(null);

  useEffect(() => {
    if (!runner) return;

    const onRunProgress = (value: RunProgress): void => {
      setProgress(value);

      if (value.status === "fail") {
        Sentry.captureMessage(
          `🕵️ Test preview failed: ${(query.test_id as string) || run?.test_id}`
        );
      }
    };

    runner.on("runprogress", onRunProgress);

    return () => {
      runner.off("runprogress", onRunProgress);
    };
  }, [query.test_id, runner, run?.test_id]);

  useEffect(() => {
    if (!run) return;

    setProgress({
      code: run.code,
      completed_at: run.completed_at,
      current_line: run.current_line,
      status: run.status,
    });
  }, [run]);

  return {
    progress,
    resetProgress: (code: string) => {
      setProgress({
        code,
        completed_at: null,
        current_line: null,
        status: "created",
      });
    },
  };
};
