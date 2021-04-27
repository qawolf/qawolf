import { useEffect } from "react";

import { useGitHubBranches, useTests as useTestsQuery } from "../hooks/queries";
import { state } from "../lib/state";
import { ShortTest } from "../lib/types";

type UseTests = {
  branch: string | null;
  teamId: string;
};

type UseTestsResult = {
  loading: boolean;
  tests: ShortTest[];
};

export const useTests = ({ branch, teamId }: UseTests): UseTestsResult => {
  const { refetch } = useGitHubBranches({ team_id: teamId }, { skip: true });

  const { data, error, startPolling, stopPolling } = useTestsQuery({
    branch,
    team_id: teamId,
  });

  // clear selected branch and refetch if not found
  useEffect(() => {
    if (error?.message?.includes("branch not found")) {
      state.setBranch(null);
      refetch();
    }
  }, [error, refetch]);

  // poll periodically for tests
  useEffect(() => {
    startPolling(30 * 1000);

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, teamId]);

  return { loading: !data?.tests, tests: data?.tests || [] };
};
