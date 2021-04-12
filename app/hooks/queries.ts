import { ApolloError, QueryResult, useQuery } from "@apollo/client";
import noop from "lodash/noop";
import { useRouter } from "next/router";

import {
  currentUserQuery,
  environmentsQuery,
  environmentVariablesQuery,
  groupsQuery,
  integrationsQuery,
  onboardingQuery,
  runCountQuery,
  runnerQuery,
  shortSuiteQuery,
  suiteQuery,
  suitesQuery,
  teamQuery,
  testHistoryQuery,
  testQuery,
  testsQuery,
  testSummariesQuery,
  testTriggersQuery,
  triggersQuery,
  wolfQuery,
} from "../graphql/queries";
import { JWT_KEY } from "../lib/client";
import { isServer } from "../lib/detection";
import { routes } from "../lib/routes";
import { state } from "../lib/state";
import {
  Environment,
  EnvironmentVariable,
  Group,
  Integration,
  Onboarding,
  Run,
  Runner,
  ShortTest,
  Suite,
  SuiteSummary,
  TeamWithUsers,
  Test,
  TestHistoryRun,
  TestSummary,
  TestTriggers,
  Trigger,
  User,
  Wolf,
} from "../lib/types";
import { useLogOut } from "./onLogOut";

type CurrentUserData = {
  currentUser: User;
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

type GroupsData = {
  groups: Group[];
};

type GroupsVariables = {
  team_id: string;
};

type IntegrationsData = {
  integrations: Integration[];
};

type IntegrationsVariables = {
  team_id: string;
};

type OnboardingData = {
  onboarding: Onboarding;
};

type OnboardingVariables = {
  team_id: string;
};

type RunCountData = {
  runCount: number;
};

type RunCountVariables = {
  team_id: string;
};

type RunnerData = {
  runner: Runner;
};

type RunnerVariables = {
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

type SuitesData = {
  suites: SuiteSummary[];
};

type SuitesVariables = {
  team_id: string | null;
};

type TeamData = {
  team: TeamWithUsers;
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

type TestSummariesData = {
  testSummaries: TestSummary[];
};

type TestSummariesVariables = {
  test_ids: string[];
  trigger_id: string | null;
};

type TestTriggersData = {
  testTriggers: TestTriggers[];
};

type TestTriggersVariables = {
  test_ids: string[];
};

type TestsData = {
  tests: ShortTest[];
};

type TestsVariables = {
  team_id: string;
};

type TriggersData = {
  triggers: Trigger[];
};

type TriggersVariables = {
  team_id: string | null;
};

type WolfData = {
  wolf: Wolf;
};

type WolfVariables = {
  user_id: string;
};

const fetchPolicy = "cache-and-network";
const nextFetchPolicy = "cache-first";
const onError = noop;

export const useCurrentUser = (): QueryResult<CurrentUserData> => {
  const handleLogOut = useLogOut();

  return useQuery<CurrentUserData>(currentUserQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onCompleted: (response) => {
      const { currentUser } = response || {};

      if (!currentUser) handleLogOut();
    },
    onError,
    skip: isServer() || !localStorage.getItem(JWT_KEY),
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
      } else if (environmentId && !response.environments.length) {
        // if no environments, clear selection
        state.setEnvironmentId(null);
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

export const useGroups = (
  variables: GroupsVariables
): QueryResult<GroupsData, GroupsVariables> => {
  return useQuery<GroupsData, GroupsVariables>(groupsQuery, {
    fetchPolicy,
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
    onError,
    skip: !variables.team_id,
    variables,
  });
};

export const useOnboarding = (
  variables: OnboardingVariables
): QueryResult<OnboardingData, OnboardingVariables> => {
  return useQuery<OnboardingData, OnboardingVariables>(onboardingQuery, {
    fetchPolicy: "network-only",
    onError,
    skip: !variables.team_id,
    variables,
  });
};

export const useRunCount = (
  variables: RunCountVariables
): QueryResult<RunCountData, RunCountVariables> => {
  return useQuery<RunCountData, RunCountVariables>(runCountQuery, {
    fetchPolicy,
    onError,
    skip: !variables.team_id,
    variables,
  });
};

export const useRunner = (
  variables: RunnerVariables,
  { skip }: { skip?: boolean }
): QueryResult<RunnerData, RunnerVariables> => {
  return useQuery<RunnerData, RunnerVariables>(runnerQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onError,
    skip: (!variables.run_id && !variables.test_id) || skip,
    variables,
  });
};

export const useSuite = (
  variables: SuiteVariables,
  { includeRuns, teamId }: { includeRuns?: boolean; teamId: string }
): QueryResult<SuiteData, SuiteVariables> => {
  const { replace } = useRouter();

  const query = includeRuns ? suiteQuery : shortSuiteQuery;

  return useQuery<SuiteData, SuiteVariables>(query, {
    fetchPolicy,
    onCompleted: (response) => {
      const { suite } = response || {};
      if (!suite) return;
      // update team id in global state as needed
      if (suite.team_id !== teamId) {
        state.setTeamId(suite.team_id);
      }
    },
    onError: (error) => {
      if (error.message.includes("not found")) {
        replace(routes.suites);
      }
    },
    skip: !variables.id,
    variables,
  });
};

export const useSuites = (
  variables: SuitesVariables,
  { pollInterval }: { pollInterval?: number }
): QueryResult<SuitesData, SuitesVariables> => {
  return useQuery<SuitesData, SuitesVariables>(suitesQuery, {
    fetchPolicy,
    onError,
    pollInterval,
    skip: !variables.team_id,
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
  variables: TestQueryVariables,
  { teamId }: { teamId: string }
): QueryResult<TestData, TestQueryVariables> => {
  const { replace } = useRouter();

  return useQuery<TestData, TestQueryVariables>(testQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onCompleted: (response) => {
      const { test } = response || {};
      // set correct team id if needed
      if (test?.test?.team_id && test.test.team_id !== teamId) {
        state.setTeamId(test.test.team_id);
      }
    },
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

export const useTestSummaries = (
  variables: TestSummariesVariables,
  { pollInterval }: { pollInterval?: number }
): QueryResult<TestSummariesData, TestSummariesVariables> => {
  return useQuery<TestSummariesData, TestSummariesVariables>(
    testSummariesQuery,
    {
      fetchPolicy,
      pollInterval,
      // if null is passed as an id, skip the query (this happens prehydration)
      skip: !variables.test_ids.length || variables.test_ids.some((id) => !id),
      variables,
    }
  );
};

export const useTestTriggers = (
  variables: TestTriggersVariables
): QueryResult<TestTriggersData, TestTriggersVariables> => {
  return useQuery<TestTriggersData, TestTriggersVariables>(testTriggersQuery, {
    fetchPolicy,
    // if null is passed as an id, skip the query (this happens prehydration)
    skip: !variables.test_ids.length || variables.test_ids.some((id) => !id),
    variables,
  });
};

export const useTests = (
  variables: TestsVariables
): QueryResult<TestsData, TestsVariables> => {
  return useQuery<TestsData, TestsVariables>(testsQuery, {
    fetchPolicy,
    skip: !variables.team_id,
    variables,
  });
};

export const useTriggers = (
  variables: TriggersVariables
): QueryResult<TriggersData, TriggersVariables> => {
  return useQuery<TriggersData, TriggersVariables>(triggersQuery, {
    fetchPolicy,
    nextFetchPolicy,
    onError,
    skip: !variables.team_id,
    variables,
  });
};

export const useWolf = (
  variables: WolfVariables
): QueryResult<WolfData, WolfVariables> => {
  return useQuery<WolfData, WolfVariables>(wolfQuery, {
    onError,
    skip: !variables.user_id,
    variables,
  });
};
