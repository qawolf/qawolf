import { gql } from "@apollo/client";

export const apiKeyFragment = gql`
  fragment ApiKeyFragment on ApiKey {
    created_at
    id
    last_used_at
    name
    token
    token_end
  }
`;

export const environmentFragment = gql`
  fragment EnvironmentFragment on Environment {
    id
    name
  }
`;

export const environmentVariableFragment = gql`
  fragment EnvironmentVariableFragment on EnvironmentVariable {
    created_at
    id
    name
  }
`;

export const groupFragment = gql`
  fragment GroupFragment on Group {
    alert_integration_id
    deployment_branches
    deployment_environment
    deployment_integration_id
    id
    is_default
    is_email_enabled
    name
    next_at
    repeat_minutes
  }
`;

export const integrationFragment = gql`
  fragment IntegrationFragment on Integration {
    github_repo_name
    id
    slack_channel
    team_name
    type
  }
`;

export const inviteFragment = gql`
  fragment InviteFragment on Invite {
    email
    id
    team_id
    wolf_name
    wolf_number
    wolf_variant
  }
`;

export const runFragment = gql`
  fragment RunFragment on Run {
    code
    completed_at
    current_line
    id
    logs_url
    started_at
    status
    suite_id
    test_id
    video_url
  }
`;

export const runnerFragment = gql`
  fragment RunnerFragment on Runner {
    api_key
    ws_url
  }
`;

export const suiteRunFragment = gql`
  fragment SuiteRunFragment on SuiteRun {
    completed_at
    gif_url
    id
    is_test_deleted
    started_at
    status
    test_id
    test_name
  }
`;

export const suiteFragment = gql`
  fragment SuiteFragment on Suite {
    created_at
    group_id
    id
    runs {
      ...SuiteRunFragment
    }
    team_id
  }
  ${suiteRunFragment}
`;

export const teamFragment = gql`
  fragment TeamFragment on Team {
    helpers
    id
    is_enabled
    name
  }
`;

export const testFragment = gql`
  fragment TestFragment on Test {
    code
    deleted_at
    id
    is_enabled
    name
    updated_at
    url
    version
  }
`;

export const userFragment = gql`
  fragment UserFragment on User {
    avatar_url
    email
    id
    onboarded_at
    teams {
      id
      name
    }
    wolf_name
    wolf_number
    wolf_variant
  }
`;
