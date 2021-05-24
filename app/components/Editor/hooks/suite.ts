import { useRouter } from "next/router";
import { useEffect } from "react";

import { useSuite as useSuiteQuery } from "../../../hooks/queries";
import { state } from "../../../lib/state";
import { Run, Suite, Team } from "../../../lib/types";

export type SuiteHook = {
  suite: Suite | null;
};

type UseSuite = {
  run?: Run;
  team?: Team;
};

export const useSuite = ({ run, team }: UseSuite): SuiteHook => {
  const { query } = useRouter();

  const { data: suiteData } = useSuiteQuery(
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

  return {
    suite,
  };
};
