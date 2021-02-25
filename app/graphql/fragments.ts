import { gql } from "@apollo/client";

export const environmentFragment = gql`
  fragment EnvironmentFragment on Environment {
    id
    name
  }
`;

export const environmentVariableFragment = gql`
  fragment EnvironmentVariableFragment on EnvironmentVariable {
    created_at
    environment_id
    id
    name
    value
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
    created_at
    current_line
    environment_id
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
    created_at
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
    environment_id
    environment_name
    environment_variables
    id
    runs {
      ...SuiteRunFragment
    }
    team_id
    trigger_id
    trigger_name
  }
  ${suiteRunFragment}
`;

export const teamFragment = gql`
  fragment TeamFragment on Team {
    alert_integration_id
    api_key
    helpers
    id
    inbox
    is_email_alert_enabled
    is_enabled
    name
    next_trigger_id
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
    version
  }
`;

export const triggerFragment = gql`
  fragment TriggerFragment on Trigger {
    color
    deployment_branches
    deployment_environment
    deployment_integration_id
    environment_id
    id
    name
    next_at
    repeat_minutes
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
