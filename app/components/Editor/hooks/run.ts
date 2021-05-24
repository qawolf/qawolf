import { useRouter } from "next/router";
import { useEffect } from "react";

import { useEditor, useSuite } from "../../../hooks/queries";
import { state } from "../../../lib/state";
import { Run, Suite, Team } from "../../../lib/types";

export type RunHook = {
  run: Run | null;
  suite: Suite | null;
};

type UseRun = {
  branch?: string;
  runId?: string;
  team?: Team;
};

const pollInterval = 2000;

export const useRun = ({ branch, runId, team }: UseRun): RunHook => {
  const { query } = useRouter();

  // TODO replace with run query
  const { data, startPolling, stopPolling } = useEditor(
    { branch, run_id: runId },
    { teamId: team?.id }
  );
  const editorData = data?.editor || null;
  const run = editorData?.run || null;

  const { data: suiteData } = useSuite(
    { id: run?.suite_id || (query?.suite_id as string) },
    { teamId: team?.id }
  );
  const suite = suiteData?.suite || null;

  // tee up correct branch and environment if test edited
  useEffect(() => {
    if (suite?.environment_id) {
      state.setEnvironmentId(suite.environment_id);
    }

    if (suite?.branch && team.git_sync_integration_id) {
      state.setBranch(suite.branch);
    }
  }, [suite, team]);

  useEffect(() => {
    if (!run || run.completed_at) return;

    startPolling(pollInterval);

    return () => {
      stopPolling();
    };
  }, [run, startPolling, stopPolling]);

  return {
    run,
    suite,
  };
};
