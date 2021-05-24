import { useEffect } from "react";

import { useEditor } from "../../../hooks/queries";
import { Run } from "../../../lib/types";

export type RunHook = {
  run: Run | null;
};

type UseRun = {
  branch?: string;
  runId?: string;
  teamId?: string;
};

const pollInterval = 2000;

export const useRun = ({ branch, runId, teamId }: UseRun): RunHook => {
  // TODO replace with run query
  const { data, startPolling, stopPolling } = useEditor(
    { branch, run_id: runId },
    { teamId }
  );
  const editorData = data?.editor || null;
  const run = editorData?.run || null;

  useEffect(() => {
    if (!run || run.completed_at) return;

    startPolling(pollInterval);

    return () => {
      stopPolling();
    };
  }, [run, startPolling, stopPolling]);

  return {
    run,
  };
};
