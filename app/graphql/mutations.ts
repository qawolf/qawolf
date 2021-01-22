import { gql } from "@apollo/client";

import {
  apiKeyFragment,
  environmentVariableFragment,
  groupFragment,
  integrationFragment,
  inviteFragment,
  teamFragment,
  testFragment,
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

export const createApiKeyMutation = gql`
  mutation createApiKey($name: String!, $team_id: ID!) {
    createApiKey(name: $name, team_id: $team_id) {
      ...ApiKeyFragment
    }
  }
  ${apiKeyFragment}
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

export const createGroupMutation = gql`
  mutation createGroup($team_id: ID!) {
    createGroup(team_id: $team_id) {
      ...GroupFragment
    }
  }
  ${groupFragment}
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
    $group_id: ID!
    $redirect_uri: String!
    $slack_code: String!
  ) {
    createSlackIntegration(
      group_id: $group_id
      redirect_uri: $redirect_uri
      slack_code: $slack_code
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
  mutation createSuite($group_id: ID!, $test_ids: [ID!]) {
    createSuite(group_id: $group_id, test_ids: $test_ids)
  }
`;

export const createTestMutation = gql`
  mutation createTest($group_id: ID, $url: String!) {
    createTest(group_id: $group_id, url: $url) {
      ...TestFragment
    }
  }
  ${testFragment}
`;

export const deleteApiKeyMutation = gql`
  mutation deleteApiKey($id: ID!) {
    deleteApiKey(id: $id) {
      ...ApiKeyFragment
    }
  }
  ${apiKeyFragment}
`;

export const deleteEnvironmentVariableMutation = gql`
  mutation deleteEnvironmentVariable($id: ID!) {
    deleteEnvironmentVariable(id: $id) {
      ...EnvironmentVariableFragment
    }
  }
  ${environmentVariableFragment}
`;

export const deleteGroupMutation = gql`
  mutation deleteGroup($id: ID!) {
    deleteGroup(id: $id) {
      default_group_id
      id
    }
  }
`;

export const deleteTestsMutation = gql`
  mutation deleteTests($ids: [ID!]!) {
    deleteTests(ids: $ids) {
      ...TestFragment
    }
  }
  ${testFragment}
`;

export const instrumentTestRunMutation = gql`
  mutation instrumentTestRun($status: RunStatus!, $test_id: ID!) {
    instrumentTestRun(status: $status, test_id: $test_id)
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

export const updateGroupMutation = gql`
  mutation updateGroup(
    $deployment_branches: String
    $deployment_environment: DeploymentEnvironment
    $deployment_integration_id: ID
    $id: ID!
    $is_email_enabled: Boolean
    $name: String
    $alert_integration_id: ID
    $repeat_minutes: Int
  ) {
    updateGroup(
      deployment_branches: $deployment_branches
      deployment_environment: $deployment_environment
      deployment_integration_id: $deployment_integration_id
      id: $id
      is_email_enabled: $is_email_enabled
      name: $name
      alert_integration_id: $alert_integration_id
      repeat_minutes: $repeat_minutes
    ) {
      ...GroupFragment
    }
  }
  ${groupFragment}
`;

export const updateGroupTestsMutation = gql`
  mutation updateGroupTests(
    $add_group_id: ID
    $remove_group_id: ID
    $test_ids: [ID!]
  ) {
    updateGroupTests(
      add_group_id: $add_group_id
      remove_group_id: $remove_group_id
      test_ids: $test_ids
    )
  }
`;

export const updateTeamMutation = gql`
  mutation updateTeam($helpers: String, $id: ID!, $name: String) {
    updateTeam(helpers: $helpers, id: $id, name: $name) {
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
