import { useEffect } from "react";

import { useRun as useRunQuery } from "../../../hooks/queries";
import { Run } from "../../../lib/types";

export type RunHook = {
  run: Run | null;
};

const pollInterval = 2000;

export const useRun = (id?: string): RunHook => {
  const { data, startPolling, stopPolling } = useRunQuery({ id });
  const run = data?.run || null;

  useEffect(() => {
    if (!run || run.completed_at) return;

    startPolling(pollInterval);

    return () => {
      stopPolling();
    };
  }, [run, startPolling, stopPolling]);

  return { run };
};
