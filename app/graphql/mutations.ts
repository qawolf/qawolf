import { gql } from "@apollo/client";

import {
  environmentFragment,
  environmentVariableFragment,
  integrationFragment,
  inviteFragment,
  teamFragment,
  testFragment,
  triggerFragment,
  userFragment,
} from "./fragments";

export const acceptInviteMutation = gql`
  mutation acceptInvite($id: ID!) {
    acceptInvite(id: $id) {
      ...InviteFragment
    }
  }
  ${inviteFragment}
`;

export const createEnvironmentMutation = gql`
  mutation createEnvironment($name: String!, $team_id: ID!) {
    createEnvironment(name: $name, team_id: $team_id) {
      ...EnvironmentFragment
    }
  }
  ${environmentFragment}
`;

export const createEnvironmentVariableMutation = gql`
  mutation createEnvironmentVariable(
    $environment_id: ID!
    $name: String!
    $value: String!
  ) {
    createEnvironmentVariable(
      environment_id: $environment_id
      name: $name
      value: $value
    ) {
      ...EnvironmentVariableFragment
    }
  }
  ${environmentVariableFragment}
`;

export const createGitHubIntegrationsMutation = gql`
  mutation createGitHubIntegrations($installation_id: ID!, $team_id: ID!) {
    createGitHubIntegrations(
      installation_id: $installation_id
      team_id: $team_id
    ) {
      ...IntegrationFragment
    }
  }
  ${integrationFragment}
`;

export const createInvitesMutation = gql`
  mutation createInvites($emails: [String!]!, $team_id: ID!) {
    createInvites(emails: $emails, team_id: $team_id) {
      ...InviteFragment
    }
  }
  ${inviteFragment}
`;

export const createSignInUrlMutation = gql`
  mutation createSignInUrl($redirect_uri: String!) {
    createSignInUrl(redirect_uri: $redirect_uri)
  }
`;

export const createSlackIntegrationMutation = gql`
  mutation createSlackIntegration(
    $redirect_uri: String!
    $slack_code: String!
    $team_id: ID!
  ) {
    createSlackIntegration(
      redirect_uri: $redirect_uri
      slack_code: $slack_code
      team_id: $team_id
    ) {
      ...IntegrationFragment
    }
  }
  ${integrationFragment}
`;

export const createSlackIntegrationUrlMutation = gql`
  mutation createSlackIntegrationUrl($redirect_uri: String!) {
    createSlackIntegrationUrl(redirect_uri: $redirect_uri)
  }
`;

export const createSuiteMutation = gql`
  mutation createSuite($test_ids: [ID!], $trigger_id: ID!) {
    createSuite(test_ids: $test_ids, trigger_id: $trigger_id)
  }
`;

export const createTestMutation = gql`
  mutation createTest($trigger_id: ID, $url: String!) {
    createTest(trigger_id: $trigger_id, url: $url) {
      ...TestFragment
    }
  }
  ${testFragment}
`;

export const createTriggerMutation = gql`
  mutation createTrigger(
    $deployment_branches: String
    $deployment_environment: DeploymentEnvironment
    $deployment_integration_id: ID
    $environment_id: ID
    $name: String!
    $repeat_minutes: Int
    $team_id: ID!
    $test_ids: [ID!]
  ) {
    createTrigger(
      deployment_branches: $deployment_branches
      deployment_environment: $deployment_environment
      deployment_integration_id: $deployment_integration_id
      environment_id: $environment_id
      name: $name
      repeat_minutes: $repeat_minutes
      team_id: $team_id
      test_ids: $test_ids
    ) {
      ...TriggerFragment
    }
  }
  ${triggerFragment}
`;

export const deleteEnvironmentMutation = gql`
  mutation deleteEnvironment($id: ID!) {
    deleteEnvironment(id: $id) {
      ...EnvironmentFragment
    }
  }
  ${environmentFragment}
`;

export const deleteEnvironmentVariableMutation = gql`
  mutation deleteEnvironmentVariable($id: ID!) {
    deleteEnvironmentVariable(id: $id) {
      ...EnvironmentVariableFragment
    }
  }
  ${environmentVariableFragment}
`;

export const deleteTestsMutation = gql`
  mutation deleteTests($ids: [ID!]!) {
    deleteTests(ids: $ids) {
      ...TestFragment
    }
  }
  ${testFragment}
`;

export const deleteTriggerMutation = gql`
  mutation deleteTrigger($id: ID!) {
    deleteTrigger(id: $id) {
      default_trigger_id
      id
    }
  }
`;

export const joinMailingListMutation = gql`
  mutation joinMailingList($email: String!) {
    joinMailingList(email: $email)
  }
`;

export const sendLoginCodeMutation = gql`
  mutation sendLoginCode($email: String!, $invite_id: ID) {
    sendLoginCode(email: $email, invite_id: $invite_id) {
      email
    }
  }
`;

export const signInWithEmailMutation = gql`
  mutation signInWithEmail($email: String!, $login_code: String!) {
    signInWithEmail(email: $email, login_code: $login_code) {
      access_token
      user {
        ...UserFragment
      }
    }
  }
  ${userFragment}
`;

export const signInWithGitHubMutation = gql`
  mutation signInWithGitHub(
    $github_code: String!
    $github_state: String!
    $invite_id: ID
  ) {
    signInWithGitHub(
      github_code: $github_code
      github_state: $github_state
      invite_id: $invite_id
    ) {
      access_token
      user {
        ...UserFragment
      }
    }
  }
  ${userFragment}
`;

export const updateEnvironmentMutation = gql`
  mutation updateEnvironment($id: ID!, $name: String!) {
    updateEnvironment(id: $id, name: $name) {
      ...EnvironmentFragment
    }
  }
  ${environmentFragment}
`;

export const updateEnvironmentVariableMutation = gql`
  mutation updateEnvironmentVariable(
    $id: ID!
    $name: String!
    $value: String!
  ) {
    updateEnvironmentVariable(id: $id, name: $name, value: $value) {
      ...EnvironmentVariableFragment
    }
  }
  ${environmentVariableFragment}
`;

export const updateTriggerMutation = gql`
  mutation updateTrigger(
    $deployment_branches: String
    $deployment_environment: DeploymentEnvironment
    $deployment_integration_id: ID
    $environment_id: ID
    $id: ID!
    $name: String
    $repeat_minutes: Int
  ) {
    updateTrigger(
      deployment_branches: $deployment_branches
      deployment_environment: $deployment_environment
      deployment_integration_id: $deployment_integration_id
      environment_id: $environment_id
      id: $id
      name: $name
      repeat_minutes: $repeat_minutes
    ) {
      ...TriggerFragment
    }
  }
  ${triggerFragment}
`;

export const updateTestTriggersMutation = gql`
  mutation updateTestTriggers(
    $add_trigger_id: ID
    $remove_trigger_id: ID
    $test_ids: [ID!]
  ) {
    updateTestTriggers(
      add_trigger_id: $add_trigger_id
      remove_trigger_id: $remove_trigger_id
      test_ids: $test_ids
    ) {
      test_id
      trigger_ids
    }
  }
`;

export const updateTeamMutation = gql`
  mutation updateTeam(
    $alert_integration_id: String
    $helpers: String
    $id: ID!
    $is_email_alert_enabled: Boolean
    $name: String
  ) {
    updateTeam(
      alert_integration_id: $alert_integration_id
      helpers: $helpers
      id: $id
      is_email_alert_enabled: $is_email_alert_enabled
      name: $name
    ) {
      ...TeamFragment
    }
  }
  ${teamFragment}
`;

export const updateTestMutation = gql`
  mutation updateTest(
    $code: String
    $id: ID!
    $is_enabled: Boolean
    $name: String
    $version: Int
  ) {
    updateTest(
      code: $code
      id: $id
      is_enabled: $is_enabled
      name: $name
      version: $version
    ) {
      ...TestFragment
    }
  }
  ${testFragment}
`;

export const updateUserMutation = gql`
  mutation updateUser($onboarded_at: String!) {
    updateUser(onboarded_at: $onboarded_at) {
      ...UserFragment
    }
  }
  ${userFragment}
`;
