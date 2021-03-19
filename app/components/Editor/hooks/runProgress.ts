import { useCallback, useContext, useEffect, useState } from "react";

import { useSendSlackUpdate } from "../../../hooks/mutations";
import { trackSegmentEvent } from "../../../hooks/segment";
import { RunnerClient } from "../../../lib/runner";
import { Run, RunProgress } from "../../../lib/types";
import { UserContext } from "../../UserContext";

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
  const { user } = useContext(UserContext);

  const [sendSlackUpdate] = useSendSlackUpdate();
  const [progress, setProgress] = useState<RunProgress | null>(null);

  const notifyPreviewFail = useCallback(() => {
    trackSegmentEvent("Test Preview Failed", { email: user?.email });
    sendSlackUpdate({ variables: { message: "🕵️‍♀️ Test Preview Failed" } });
  }, [sendSlackUpdate, user?.email]);

  useEffect(() => {
    if (!runner) return;

    const onRunProgress = (value: RunProgress): void => {
      setProgress(value);
      if (value.status === "fail") notifyPreviewFail();
    };

    const onRunStopped = (): void => setProgress(null);

    runner.on("runprogress", onRunProgress);
    runner.on("runstopped", onRunStopped);

    return () => {
      runner.off("runprogress", onRunProgress);
      runner.off("runstopped", onRunStopped);
    };
  }, [notifyPreviewFail, runner]);

  useEffect(() => {
    if (!run) return;

    setProgress({
      code: run.code,
      completed_at: run.completed_at,
      current_line: run.current_line,
      status: run.status,
    });
  }, [run, user?.email]);

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
