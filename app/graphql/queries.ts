import { gql } from "@apollo/client";

import {
  apiKeyFragment,
  environmentFragment,
  environmentVariableFragment,
  integrationFragment,
  inviteFragment,
  runFragment,
  runnerFragment,
  suiteFragment,
  suiteRunFragment,
  teamFragment,
  testFragment,
  triggerFragment,
  userFragment,
} from "./fragments";

export const apiKeysQuery = gql`
  query apiKeys($team_id: ID!) {
    apiKeys(team_id: $team_id) {
      ...ApiKeyFragment
    }
  }
  ${apiKeyFragment}
`;

export const currentUserQuery = gql`
  query currentUser {
    currentUser {
      ...UserFragment
    }
  }
  ${userFragment}
`;

export const dashboardQuery = gql`
  query dashboard($trigger_id: ID!) {
    dashboard(trigger_id: $trigger_id) {
      suites {
        ...SuiteFragment
      }
      tests {
        ...TestFragment
        summary {
          gif_url
          last_runs {
            ...SuiteRunFragment
          }
        }
      }
    }
  }
  ${suiteFragment}
  ${testFragment}
  ${suiteRunFragment}
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

export const integrationsQuery = gql`
  query integrations($team_id: ID!) {
    integrations(team_id: $team_id) {
      ...IntegrationFragment
    }
  }
  ${integrationFragment}
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

export const suiteQuery = gql`
  query suite($id: ID!) {
    suite(id: $id) {
      id
      team_id
      trigger_id
    }
  }
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

export const testTriggersQuery = gql`
  query testTriggers($test_ids: [ID!]!) {
    testTriggers(test_ids: $test_ids)
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
