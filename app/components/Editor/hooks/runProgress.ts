import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useSendSlackUpdate } from "../../../hooks/mutations";
import { trackSegmentEvent } from "../../../hooks/segment";
import { RunnerClient } from "../../../lib/runner";
import { Run, RunProgress } from "../../../lib/types";

export type RunProgressHook = {
  progress: RunProgress | null;
  resetProgress: (code: string | null) => void;
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
  const [sendSlackUpdate] = useSendSlackUpdate();

  const [progress, setProgress] = useState<RunProgress | null>(null);

  useEffect(() => {
    if (!runner) return;

    const onRunProgress = (value: RunProgress): void => {
      setProgress(value);

      if (value.status === "fail") {
        trackSegmentEvent("Test Preview Failed");
        sendSlackUpdate({ variables: { message: "🕵️‍♀️ Test Preview Failed" } });
      }
    };

    const onRunStopped = (): void => setProgress(null);

    runner.on("runprogress", onRunProgress);
    runner.on("runstopped", onRunStopped);

    return () => {
      runner.off("runprogress", onRunProgress);
      runner.off("runstopped", onRunStopped);
    };
  }, [query.test_id, runner, run?.test_id, sendSlackUpdate]);

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
    resetProgress: (code: string | null) => {
      if (code === null) {
        setProgress(null);
        return;
      }

      setProgress({
        code,
        completed_at: null,
        current_line: null,
        status: "created",
      });
    },
  };
};
