import { ApolloError, QueryResult, useQuery } from "@apollo/client";
import noop from "lodash/noop";
import { useRouter } from "next/router";

import {
  apiKeysQuery,
  currentUserQuery,
  dashboardQuery,
  environmentVariablesQuery,
  groupsQuery,
  integrationsQuery,
  runnerQuery,
  suiteQuery,
  teamQuery,
  testQuery,
} from "../graphql/queries";
import { JWT_KEY } from "../lib/client";
import { isServer } from "../lib/detection";
import { routes } from "../lib/routes";
import { state } from "../lib/state";
import {
  ApiKey,
  EnvironmentVariable,
  Group,
  Integration,
  Invite,
  Run,
  Runner,
  Suite,
  Team,
  Test,
  TestWithSummary,
  User,
} from "../lib/types";

type ApiKeysData = {
  apiKeys: ApiKey[];
};

type ApiKeysVariables = {
  team_id: string;
};

type CurrentUserData = {
  currentUser: User;
};

type DashboardData = {
  dashboard: {
    suites: Suite[];
    tests: TestWithSummary[];
  };
};

type DashboardVariables = {
  group_id?: string | null;
};

type EnvironmentVariablesData = {
  environmentVariables: {
    env: string;
    variables: EnvironmentVariable[];
  };
};

type EnvironmentVariablesVariables = {
  group_id: string;
};

type GroupsData = {
  groups: Group[];
};

type GroupsVariables = {
  team_id: string | null;
};

type IntegrationsData = {
  integrations: Integration[];
};

type IntegrationsVariables = {
  team_id: string;
};

type RunnerData = {
  runner: Runner;
};

type RunnerQueryVariables = {
  run_id?: string | null;
  should_request_runner?: boolean;
  test_id?: string;
};

type SuiteData = {
  suite: Suite;
};

type SuiteVariables = {
  id: string | null;
};

type TeamData = {
  team: Team & {
    invites: Invite[];
    users: User[];
  };
};

type TeamVariables = {
  id: string;
};

type TestData = {
  test: {
    run: Run;
    test: Test;
  };
};

type TestQueryVariables = {
  id?: string;
  run_id?: string | null;
};

const fetchPolicy = "cache-and-network";
const nextFetchPolicy = "cache-first";
const onError = noop;

export const useApiKeys = (
  variables: ApiKeysVariables
): QueryResult<ApiKeysData, ApiKeysVariables> => {
  return useQuery<ApiKeysData, ApiKeysVariables>(apiKeysQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onError,
    skip: !variables.team_id,
    variables,
  });
};

export const useCurrentUser = (): QueryResult<CurrentUserData> => {
  return useQuery<CurrentUserData>(currentUserQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onCompleted: (response) => {
      const { currentUser } = response || {};

      if (!currentUser) {
        localStorage.removeItem(JWT_KEY);
      }
    },
    onError,
    skip: isServer() || !localStorage.getItem(JWT_KEY),
  });
};

export const useDashboard = (
  variables: DashboardVariables
): QueryResult<DashboardData, DashboardVariables> => {
  return useQuery<DashboardData, DashboardVariables>(dashboardQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onError,
    skip: !variables.group_id,
    variables,
  });
};

export const useEnvironmentVariables = (
  variables: EnvironmentVariablesVariables
): QueryResult<EnvironmentVariablesData, EnvironmentVariablesVariables> => {
  return useQuery<EnvironmentVariablesData, EnvironmentVariablesVariables>(
    environmentVariablesQuery,
    {
      fetchPolicy,
      nextFetchPolicy,
      onError,
      skip: !variables.group_id,
      variables,
    }
  );
};

export const useGroups = (
  variables: GroupsVariables,
  { groupId, skipOnCompleted }: { groupId: string; skipOnCompleted: boolean }
): QueryResult<GroupsData, GroupsVariables> => {
  return useQuery<GroupsData, GroupsVariables>(groupsQuery, {
    fetchPolicy,
    nextFetchPolicy,
    // ensure that valid group is selected
    onCompleted: (response) => {
      const { groups } = response || {};
      if (skipOnCompleted || !groups?.length) return;

      const currentGroup = groups.find((g) => g.id === groupId);
      const newSelectedGroupId = currentGroup?.id || groups[0].id;

      if (groupId !== newSelectedGroupId) {
        state.setGroupId(newSelectedGroupId);
      }
    },
    onError,
    skip: !variables.team_id,
    variables,
  });
};

export const useIntegrations = (
  variables: IntegrationsVariables
): QueryResult<IntegrationsData, IntegrationsVariables> => {
  return useQuery<IntegrationsData, IntegrationsVariables>(integrationsQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onError,
    skip: !variables.team_id,
    variables,
  });
};

export const useRunner = (
  variables: RunnerQueryVariables,
  skip?: boolean
): QueryResult<RunnerData, RunnerQueryVariables> => {
  return useQuery<RunnerData, RunnerQueryVariables>(runnerQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onError,
    skip: (!variables.run_id && !variables.test_id) || skip,
    variables,
  });
};

export const useSuite = (
  variables: SuiteVariables,
  { groupId, teamId }: { groupId: string; teamId: string }
): QueryResult<SuiteData, SuiteVariables> => {
  const { replace } = useRouter();

  return useQuery<SuiteData, SuiteVariables>(suiteQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onCompleted: (response) => {
      const { suite } = response || {};
      if (!suite) return;
      // update team and group ids in global state as needed
      if (suite.team_id !== teamId) {
        state.setTeamId(suite.team_id);
      }
      // redirect to correct route if invalid group id in url
      if (suite.group_id !== groupId) {
        state.setGroupId(suite.group_id);
      }
    },
    onError: (error) => {
      if (error.message.includes("not found")) {
        replace(routes.tests);
      }
    },
    skip: !variables.id,
    variables,
  });
};

export const useTeam = (
  variables: TeamVariables
): QueryResult<TeamData, TeamVariables> => {
  return useQuery<TeamData, TeamVariables>(teamQuery, {
    fetchPolicy,
    onError,
    skip: !variables.id,
    variables,
  });
};

export const useTest = (
  variables: TestQueryVariables
): QueryResult<TestData, TestQueryVariables> => {
  const { replace } = useRouter();

  return useQuery<TestData, TestQueryVariables>(testQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onError: (error: ApolloError) => {
      if (
        error.message.includes("cannot access") ||
        error.message.includes("not found")
      ) {
        replace(routes.tests);
      }
    },
    skip: !variables.id && !variables.run_id,
    variables,
  });
};
