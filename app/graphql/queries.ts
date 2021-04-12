import { gql } from "@apollo/client";

import {
  environmentFragment,
  environmentVariableFragment,
  groupFragment,
  integrationFragment,
  inviteFragment,
  runFragment,
  runnerFragment,
  shortTriggerFragment,
  suiteFragment,
  teamFragment,
  testFragment,
  testTriggersFragment,
  triggerFragment,
  userFragment,
  wolfFragment,
} from "./fragments";

export const currentUserQuery = gql`
  query currentUser {
    currentUser {
      intercom_hash
      ...UserFragment
    }
  }
  ${userFragment}
`;

export const environmentsQuery = gql`
  query environments($team_id: ID!) {
    environments(team_id: $team_id) {
      ...EnvironmentFragment
    }
  }
  ${environmentFragment}
`;

export const environmentVariablesQuery = gql`
  query environmentVariables($environment_id: ID!) {
    environmentVariables(environment_id: $environment_id) {
      env
      variables {
        ...EnvironmentVariableFragment
      }
    }
  }
  ${environmentVariableFragment}
`;

export const groupsQuery = gql`
  query groups($team_id: ID!) {
    groups(team_id: $team_id) {
      ...GroupFragment
    }
  }
  ${groupFragment}
`;

export const integrationsQuery = gql`
  query integrations($team_id: ID!) {
    integrations(team_id: $team_id) {
      ...IntegrationFragment
    }
  }
  ${integrationFragment}
`;

export const onboardingQuery = gql`
  query onboarding($team_id: ID!) {
    onboarding(team_id: $team_id) {
      has_added_trigger_to_test
      has_completed_tutorial
      has_created_test
      has_invited_user
    }
  }
`;

export const runCountQuery = gql`
  query runCount($team_id: ID!) {
    runCount(team_id: $team_id)
  }
`;

export const runnerQuery = gql`
  query runner($run_id: ID, $should_request_runner: Boolean, $test_id: ID) {
    runner(
      run_id: $run_id
      should_request_runner: $should_request_runner
      test_id: $test_id
    ) {
      ...RunnerFragment
    }
  }
  ${runnerFragment}
`;

export const shortSuiteQuery = gql`
  query suite($id: ID!) {
    suite(id: $id) {
      created_at
      environment_id
      environment_name
      environment_variables
      id
      team_id
      trigger {
        ...ShortTriggerFragment
      }
    }
  }
  ${shortTriggerFragment}
`;

export const suiteQuery = gql`
  query suite($id: ID!) {
    suite(id: $id) {
      ...SuiteFragment
    }
  }
  ${suiteFragment}
`;

export const suitesQuery = gql`
  query suites($team_id: ID!) {
    suites(team_id: $team_id) {
      created_at
      environment_id
      environment_name
      id
      status_counts {
        created
        fail
        pass
      }
      team_id
      trigger {
        ...ShortTriggerFragment
      }
    }
  }
  ${shortTriggerFragment}
`;

export const teamQuery = gql`
  query team($id: ID!) {
    team(id: $id) {
      ...TeamFragment
      invites {
        ...InviteFragment
      }
      users {
        avatar_url
        email
        id
        wolf_name
        wolf_variant
      }
    }
  }
  ${teamFragment}
  ${inviteFragment}
`;

export const testQuery = gql`
  query test($id: ID, $run_id: ID) {
    test(id: $id, run_id: $run_id) {
      run {
        ...RunFragment
      }
      test {
        ...TestFragment
      }
    }
  }
  ${runFragment}
  ${testFragment}
`;

export const testHistoryQuery = gql`
  query testHistory($id: ID!) {
    testHistory(id: $id) {
      created_at
      id
      started_at
      status
    }
  }
`;

export const testSummariesQuery = gql`
  query testSummaries($test_ids: [ID!]!, $trigger_id: ID) {
    testSummaries(test_ids: $test_ids, trigger_id: $trigger_id) {
      gif_url
      last_runs {
        created_at
        gif_url
        id
        status
      }
      test_id
    }
  }
`;

export const testTriggersQuery = gql`
  query testTriggers($test_ids: [ID!]!) {
    testTriggers(test_ids: $test_ids) {
      ...TestTriggersFragment
    }
  }
  ${testTriggersFragment}
`;

export const testsQuery = gql`
  query tests($team_id: ID!) {
    tests(team_id: $team_id) {
      group_id
      id
      name
    }
  }
`;

export const triggersQuery = gql`
  query triggers($team_id: ID!) {
    triggers(team_id: $team_id) {
      ...TriggerFragment
    }
  }
  ${triggerFragment}
`;

export const wolfQuery = gql`
  query wolf($user_id: ID!) {
    wolf(user_id: $user_id) {
      ...WolfFragment
    }
  }
  ${wolfFragment}
`;
