import { gql } from "@apollo/client";

import {
  apiKeyFragment,
  environmentVariableFragment,
  groupFragment,
  integrationFragment,
  inviteFragment,
  runFragment,
  runnerFragment,
  suiteFragment,
  suiteRunFragment,
  teamFragment,
  testFragment,
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
  query dashboard($group_id: ID!) {
    dashboard(group_id: $group_id) {
      suites {
        ...SuiteFragment
      }
      tests {
        ...TestFragment
        groups {
          id
          name
        }
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

export const environmentVariablesQuery = gql`
  query environmentVariables($group_id: ID!) {
    environmentVariables(group_id: $group_id) {
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
      group_id
      id
      team_id
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
