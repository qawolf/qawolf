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

export const groupFragment = gql`
  fragment GroupFragment on Group {
    id
    name
    team_id
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
    vnc_url
    ws_url
  }
`;

export const shortTriggerFragment = gql`
  fragment ShortTriggerFragment on Trigger {
    color
    deployment_provider
    id
    name
    repeat_minutes
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
    branch
    created_at
    environment_id
    environment_name
    environment_variables
    id
    runs {
      ...SuiteRunFragment
    }
    team_id
    trigger {
      ...ShortTriggerFragment
    }
  }
  ${suiteRunFragment}
  ${shortTriggerFragment}
`;

export const teamFragment = gql`
  fragment TeamFragment on Team {
    alert_integration_id
    alert_only_on_failure
    api_key
    git_sync_integration_id
    helpers
    id
    inbox
    is_email_alert_enabled
    is_enabled
    name
    next_trigger_id
    plan
    renewed_at
  }
`;

export const testFragment = gql`
  fragment TestFragment on Test {
    code
    deleted_at
    group_id
    id
    is_enabled
    name
    path
    team_id
    updated_at
    url
  }
`;

export const testTriggersFragment = gql`
  fragment TestTriggersFragment on TestTriggers {
    group_id
    test_id
    trigger_ids
  }
`;

export const triggerFragment = gql`
  fragment TriggerFragment on Trigger {
    color
    deployment_branches
    deployment_environment
    deployment_integration_id
    deployment_provider
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

export const wolfFragment = gql`
  fragment WolfFragment on Wolf {
    name
    number
    variant
  }
`;
