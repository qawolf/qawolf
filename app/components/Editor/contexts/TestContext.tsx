import { useRouter } from "next/router";
import { createContext, FC, useContext, useEffect } from "react";

import { useEditor, useSuite, useTeam } from "../../../hooks/queries";
import { state } from "../../../lib/state";
import { Run, Suite, Team, Test } from "../../../lib/types";
import { StateContext } from "../../StateContext";
import { useEditorController } from "../hooks/editorController";
import { EditorController } from "./EditorController";

type TestContextValue = {
  code: string | null;
  controller: EditorController | null;
  hasWriteAccess: boolean;
  isTestLoading: boolean;
  run: Run | null;
  suite: Suite | null;
  team: Team | null;
  test: Test | null;
};

export const TestContext = createContext<TestContextValue>({
  code: null,
  controller: null,
  hasWriteAccess: false,
  isTestLoading: true,
  run: null,
  suite: null,
  team: null,
  test: null,
});

const pollInterval = 2000;

export const TestProvider: FC = ({ children }) => {
  const { branch, environmentId, teamId } = useContext(StateContext);

  const { query } = useRouter();

  const run_id = query.run_id as string;
  const test_id = query.test_id as string;

  const { code, editorController } = useEditorController();

  const { data: teamData } = useTeam({ id: teamId });
  const { data, loading, startPolling, stopPolling } = useEditor(
    {
      branch,
      run_id,
      test_id,
    },
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

  // tee up correct environment if test edited
  useEffect(() => {
    if (!suite?.environment_id || suite.environment_id === environmentId) {
      return;
    }

    state.setEnvironmentId(suite.environment_id);
  }, [environmentId, suite]);

  useEffect(() => {
    if (!run || run.completed_at) return;

    startPolling(pollInterval);

    return () => {
      stopPolling();
    };
  }, [run, startPolling, stopPolling]);

  useEffect(() => {
    if (!editorController || !editorData) return;

    editorController.setValue(editorData);
  }, [editorController, editorData]);

  const value = {
    code,
    controller: editorController,
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
