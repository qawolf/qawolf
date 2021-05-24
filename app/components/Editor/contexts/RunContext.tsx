import { useRouter } from "next/router";
import { createContext, FC, useContext, useEffect } from "react";

import { useEditor, useSuite } from "../../../hooks/queries";
import { state } from "../../../lib/state";
import { Run, Suite } from "../../../lib/types";
import { StateContext } from "../../StateContext";
import { EditorContext } from "./EditorContext";

type RunContextValue = {
  run: Run | null;
  suite: Suite | null;
};

export const RunContext = createContext<RunContextValue>({
  run: null,
  suite: null,
});

const pollInterval = 2000;

// TODO move into one useRun hook
export const RunProvider: FC = ({ children }) => {
  const { query } = useRouter();
  const { runId, team } = useContext(EditorContext);
  const { branch, teamId } = useContext(StateContext);

  // TODO replace with useRun
  const { data, startPolling, stopPolling } = useEditor(
    { branch, run_id: runId },
    { teamId }
  );
  const editorData = data?.editor || null;
  const run = editorData?.run || null;

  const { data: suiteData } = useSuite(
    { id: run?.suite_id || (query?.suite_id as string) },
    { teamId }
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

  const value = {
    run,
    suite,
  };

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
};
