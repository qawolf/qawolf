import { useRouter } from "next/router";
import { createContext, FC, useContext, useEffect } from "react";

import { useEditor, useSuite, useTeam } from "../../../hooks/queries";
import { state } from "../../../lib/state";
import { Run, Suite, Team, Test } from "../../../lib/types";
import { StateContext } from "../../StateContext";

type TestContextValue = {
  isTestLoading: boolean;
  run: Run | null;
  suite: Suite | null;
  team: Team | null;
  test: Test | null;
};

export const TestContext = createContext<TestContextValue>({
  isTestLoading: true,
  run: null,
  suite: null,
  team: null,
  test: null,
});

const pollInterval = 2000;

export const TestProvider: FC = ({ children }) => {
  const { branch, teamId } = useContext(StateContext);

  const { query } = useRouter();

  const run_id = query.run_id as string;
  const test_id = query.test_id as string;

  const { data: teamData } = useTeam({ id: teamId });
  const { data, loading, startPolling, stopPolling } = useEditor(
    { branch, run_id, test_id },
    { teamId }
  );
  const editorData = data?.editor || null;

  const run = editorData?.run || null;
  const team = teamData?.team || null;
  const test = editorData?.test || null;

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
    hasWriteAccess: test_id && !test?.deleted_at,
    // only consider the test loading the first time it loads (when there is no test data)
    // this prevents the loading placeholder from flashing every poll
    isTestLoading: !data && loading,
    run,
    suite,
    team,
    test,
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};
