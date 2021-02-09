import { ApolloError, QueryResult, useQuery } from "@apollo/client";
import noop from "lodash/noop";
import { useRouter } from "next/router";

import {
  apiKeysQuery,
  currentUserQuery,
  dashboardQuery,
  environmentsQuery,
  environmentVariablesQuery,
  integrationsQuery,
  runnerQuery,
  suiteQuery,
  teamQuery,
  testHistoryQuery,
  testQuery,
  triggersQuery,
} from "../graphql/queries";
import { JWT_KEY } from "../lib/client";
import { isServer } from "../lib/detection";
import { routes } from "../lib/routes";
import { state } from "../lib/state";
import {
  ApiKey,
  Environment,
  EnvironmentVariable,
  Integration,
  Invite,
  Run,
  Runner,
  Suite,
  Team,
  Test,
  TestHistoryRun,
  TestWithSummary,
  Trigger,
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
  trigger_id?: string | null;
};

type EnvironmentsData = {
  environments: Environment[];
};

type EnvironmentsVariables = {
  team_id: string;
};

type EnvironmentVariablesData = {
  environmentVariables: {
    env: string;
    variables: EnvironmentVariable[];
  };
};

type EnvironmentVariablesVariables = {
  environment_id: string;
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

type TestHistoryData = {
  testHistory: TestHistoryRun[];
};

type TestHistoryVariables = {
  id: string;
};

type TriggersData = {
  triggers: Trigger[];
};

type TriggersVariables = {
  team_id: string | null;
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
    skip: !variables.trigger_id,
    variables,
  });
};

export const useEnvironments = (
  variables: EnvironmentsVariables,
  { environmentId }: { environmentId: string | null }
): QueryResult<EnvironmentsData, EnvironmentsVariables> => {
  return useQuery<EnvironmentsData, EnvironmentsVariables>(environmentsQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onCompleted: (response) => {
      if (!response?.environments) return;

      const selected = response.environments.find(
        (e) => e.id === environmentId
      );
      // set an environment if possible and if none are currently selected
      if (!selected && response.environments.length) {
        state.setEnvironmentId(response.environments[0].id);
      }
    },
    onError,
    skip: !variables.team_id,
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
      skip: !variables.environment_id,
      variables,
    }
  );
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
  { skip }: { skip?: boolean }
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
  { teamId, triggerId }: { teamId: string; triggerId: string }
): QueryResult<SuiteData, SuiteVariables> => {
  const { replace } = useRouter();

  return useQuery<SuiteData, SuiteVariables>(suiteQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onCompleted: (response) => {
      const { suite } = response || {};
      if (!suite) return;
      // update team and trigger ids in global state as needed
      if (suite.team_id !== teamId) {
        state.setTeamId(suite.team_id);
      }
      // redirect to correct route if invalid trigger id in url
      if (suite.trigger_id !== triggerId) {
        state.setTriggerId(suite.trigger_id);
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

export const useTestHistory = (
  variables: TestHistoryVariables
): QueryResult<TestHistoryData, TestHistoryVariables> => {
  return useQuery<TestHistoryData, TestHistoryVariables>(testHistoryQuery, {
    fetchPolicy,
    skip: !variables.id,
    variables,
  });
};

export const useTriggers = (
  variables: TriggersVariables,
  {
    skipOnCompleted,
    triggerId,
  }: { skipOnCompleted: boolean; triggerId: string }
): QueryResult<TriggersData, TriggersVariables> => {
  return useQuery<TriggersData, TriggersVariables>(triggersQuery, {
    fetchPolicy,
    nextFetchPolicy,
    // ensure that valid trigger is selected
    onCompleted: (response) => {
      const { triggers } = response || {};
      if (skipOnCompleted || !triggers?.length) return;

      const currentTrigger = triggers.find((t) => t.id === triggerId);
      const newSelectedTriggerId = currentTrigger?.id || triggers[0].id;

      if (triggerId !== newSelectedTriggerId) {
        state.setTriggerId(newSelectedTriggerId);
      }
    },
    onError,
    skip: !variables.team_id,
    variables,
  });
};
