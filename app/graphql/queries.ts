import { gql } from "@apollo/client";

import {
  environmentFragment,
  environmentVariableFragment,
  integrationFragment,
  inviteFragment,
  runFragment,
  runnerFragment,
  shortTriggerFragment,
  suiteFragment,
  tagFragment,
  tagsForTestFragment,
  teamFragment,
  testFragment,
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

export const editorQuery = gql`
  query editor($branch: String, $run_id: ID, $test_id: ID) {
    editor(branch: $branch, run_id: $run_id, test_id: $test_id) {
      helpers
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

export const gitHubBranchesQuery = gql`
  query gitHubBranches($team_id: ID!) {
    gitHubBranches(team_id: $team_id) {
      is_default
      name
    }
  }
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
      has_completed_tutorial
      has_created_test
      has_invited_user
      has_trigger
    }
  }
`;

export const runCountQuery = gql`
  query runCount($team_id: ID!) {
    runCount(team_id: $team_id)
  }
`;

export const runnerQuery = gql`
  query runner(
    $request_test_runner: Boolean
    $run_id: ID
    $test_branch: String
    $test_id: ID
  ) {
    runner(
      request_test_runner: $request_test_runner
      run_id: $run_id
      test_branch: $test_branch
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
      branch
      created_at
      environment_id
      environment_name
      environment_variables
      id
      is_api
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
      branch
      created_at
      environment_id
      environment_name
      id
      is_api
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

export const tagsQuery = gql`
  query tags($team_id: ID!) {
    tags(team_id: $team_id) {
      ...TagFragment
    }
  }
  ${tagFragment}
`;

export const tagsForTestsQuery = gql`
  query tagsForTests($test_ids: [ID!]!) {
    tagsForTests(test_ids: $test_ids) {
      ...TagsForTestFragment
    }
  }
  ${tagsForTestFragment}
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
  query testSummaries($test_ids: [ID!]!) {
    testSummaries(test_ids: $test_ids) {
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

export const testsQuery = gql`
  query tests($branch: String, $team_id: ID!) {
    tests(branch: $branch, team_id: $team_id) {
      id
      name
      path
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
