import { useRouter } from "next/router";
import { createContext, FC, useContext, useEffect } from "react";

import { useTeam, useTest } from "../../../hooks/queries";
import { Run, Team, Test } from "../../../lib/types";
import { StateContext } from "../../StateContext";
import { useController } from "../hooks/controller";
import { TestController } from "./TestController";

type TestContextValue = {
  code: string;
  controller: TestController | null;
  hasWriteAccess: boolean;
  isTestLoading: boolean;
  run: Run | null;
  team: Team | null;
  test: Test | null;
};

export const TestContext = createContext<TestContextValue>({
  code: "",
  controller: null,
  hasWriteAccess: false,
  isTestLoading: true,
  run: null,
  team: null,
  test: null,
});

const pollInterval = 2000;

export const TestProvider: FC = ({ children }) => {
  const { teamId } = useContext(StateContext);

  const { query } = useRouter();
  const run_id = query.run_id as string;
  const test_id = query.test_id as string;

  const { data: teamData } = useTeam({ id: teamId });
  const { data, loading, startPolling, stopPolling } = useTest({
    id: test_id,
    run_id,
  });

  const run = data?.test?.run || null;
  const team = teamData?.team || null;
  const test = data?.test?.test || null;

  const { code, controller } = useController({ run, test });

  useEffect(() => {
    if (!run || run.completed_at) return;

    startPolling(pollInterval);

    return () => {
      stopPolling();
    };
  }, [run, startPolling, stopPolling]);

  const value = {
    // this is more up-to-date than test.code since it does not wait for apollo to update
    code,
    controller,
    hasWriteAccess: test_id && !test?.deleted_at,
    // only consider the test loading the first time it loads (when there is no test data)
    // this prevents the loading placeholder from flashing every poll
    isTestLoading: !data && loading,
    run,
    team,
    test,
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};
