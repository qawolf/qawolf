import { useRouter } from "next/router";
import { createContext, FC, useContext } from "react";

import { useTeam, useTest } from "../../../hooks/queries";
import { Run, Team, Test } from "../../../lib/types";
import { StateContext } from "../../StateContext";
import { useController } from "../hooks/controller";
import { useIsLatestCode } from "../hooks/isLatestCode";
import { TestController } from "./TestController";

type TestContextValue = {
  code: string;
  controller: TestController | null;
  hasWriteAccess: boolean;
  isLatestCode: boolean;
  isTestLoading: boolean;
  run: Run | null;
  team: Team | null;
  test: Test | null;
};

export const TestContext = createContext<TestContextValue>({
  code: "",
  controller: null,
  hasWriteAccess: false,
  isLatestCode: false,
  isTestLoading: true,
  run: null,
  team: null,
  test: null,
});

// TODO: handle deleted test
export const TestProvider: FC = ({ children }) => {
  const { teamId } = useContext(StateContext);

  const { query } = useRouter();
  const run_id = query.run_id as string;
  const test_id = query.test_id as string;

  const { data: teamData } = useTeam({ id: teamId });
  const { data, loading } = useTest({ id: test_id, run_id });

  const run = data?.test?.run || null;
  const team = teamData?.team || null;
  const test = data?.test?.test || null;

  const isLatestCode = useIsLatestCode({ run, test });

  const { code, controller } = useController({ isLatestCode, run, test });

  const value = {
    // this is more up-to-date than test.code since it does not wait for apollo to update
    code,
    controller,
    hasWriteAccess: isLatestCode && !test?.deleted_at,
    isLatestCode,
    // only consider the test loading the first time it loads (when there is no test data)
    // this prevents the loading placeholder from flashing every poll
    isTestLoading: !data && loading,
    run,
    team,
    test,
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};
