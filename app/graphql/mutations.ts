import { gql } from "@apollo/client";

import {
  environmentFragment,
  environmentVariableFragment,
  fileFragment,
  integrationFragment,
  inviteFragment,
  tagFragment,
  tagsForTestFragment,
  teamFragment,
  testFragment,
  triggerFragment,
  userFragment,
  wolfFragment,
} from "./fragments";

export const acceptInviteMutation = gql`
  mutation acceptInvite($id: ID!) {
    acceptInvite(id: $id) {
      ...InviteFragment
    }
  }
  ${inviteFragment}
`;

export const commitEditorMutation = gql`
  mutation commitEditor(
    $branch: String!
    $code: String
    $helpers: String
    $path: String
    $test_id: ID!
  ) {
    commitEditor(
      branch: $branch
      code: $code
      helpers: $helpers
      path: $path
      test_id: $test_id
    ) {
      helpers {
        ...FileFragment
      }
      test {
        ...FileFragment
      }
    }
  }
  ${fileFragment}
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
  mutation createGitHubIntegrations(
    $installation_id: ID!
    $is_sync: Boolean!
    $team_id: ID!
  ) {
    createGitHubIntegrations(
      installation_id: $installation_id
      is_sync: $is_sync
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

export const createStripeCheckoutSessionMutation = gql`
  mutation createStripeCheckoutSession(
    $app_url: String!
    $cancel_uri: String!
    $team_id: ID!
  ) {
    createStripeCheckoutSession(
      app_url: $app_url
      cancel_uri: $cancel_uri
      team_id: $team_id
    )
  }
`;

export const createStripePortalSessionMutation = gql`
  mutation createStripePortalSession(
    $app_url: String!
    $return_uri: String!
    $team_id: ID!
  ) {
    createStripePortalSession(
      app_url: $app_url
      return_uri: $return_uri
      team_id: $team_id
    )
  }
`;

export const createSubscriberMutation = gql`
  mutation createSubscriber($email: String!) {
    createSubscriber(email: $email)
  }
`;

export const createSuiteMutation = gql`
  mutation createSuite(
    $branch: String
    $environment_id: ID
    $environment_variables: String
    $test_ids: [ID!]!
  ) {
    createSuite(
      branch: $branch
      environment_id: $environment_id
      environment_variables: $environment_variables
      test_ids: $test_ids
    )
  }
`;

export const createTagMutation = gql`
  mutation createTag($name: String!, $team_id: ID!, $test_ids: [ID!]) {
    createTag(name: $name, team_id: $team_id, test_ids: $test_ids) {
      ...TagFragment
    }
  }
  ${tagFragment}
`;

export const createTeamMutation = gql`
  mutation createTeam {
    createTeam {
      ...TeamFragment
    }
  }
  ${teamFragment}
`;

export const createTestMutation = gql`
  mutation createTest(
    $branch: String
    $guide: String
    $team_id: ID!
    $url: String!
  ) {
    createTest(branch: $branch, guide: $guide, team_id: $team_id, url: $url) {
      ...TestFragment
    }
  }
  ${testFragment}
`;

export const createTriggerMutation = gql`
  mutation createTrigger(
    $deployment_branches: String
    $deployment_environment: String
    $deployment_integration_id: ID
    $deployment_preview_url: String
    $deployment_provider: DeploymentProvider
    $environment_id: ID
    $name: String!
    $repeat_minutes: Int
    $team_id: ID!
    $tag_ids: [ID!]
  ) {
    createTrigger(
      deployment_branches: $deployment_branches
      deployment_environment: $deployment_environment
      deployment_integration_id: $deployment_integration_id
      deployment_preview_url: $deployment_preview_url
      deployment_provider: $deployment_provider
      environment_id: $environment_id
      name: $name
      repeat_minutes: $repeat_minutes
      team_id: $team_id
      tag_ids: $tag_ids
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

export const deleteTagMutation = gql`
  mutation deleteTag($id: ID!) {
    deleteTag(id: $id) {
      ...TagFragment
    }
  }
  ${tagFragment}
`;

export const deleteTestsMutation = gql`
  mutation deleteTests($branch: String, $ids: [ID!]!) {
    deleteTests(branch: $branch, ids: $ids) {
      ...TestFragment
    }
  }
  ${testFragment}
`;

export const deleteTriggerMutation = gql`
  mutation deleteTrigger($id: ID!) {
    deleteTrigger(id: $id) {
      ...TriggerFragment
    }
  }
  ${triggerFragment}
`;

export const sendLoginCodeMutation = gql`
  mutation sendLoginCode(
    $email: String!
    $invite_id: ID
    $is_subscribed: Boolean
  ) {
    sendLoginCode(
      email: $email
      invite_id: $invite_id
      is_subscribed: $is_subscribed
    ) {
      email
    }
  }
`;

export const sendSlackUpdateMutation = gql`
  mutation sendSlackUpdate($message: String!) {
    sendSlackUpdate(message: $message)
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
    $is_subscribed: Boolean
  ) {
    signInWithGitHub(
      github_code: $github_code
      github_state: $github_state
      invite_id: $invite_id
      is_subscribed: $is_subscribed
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

export const updateTagMutation = gql`
  mutation updateTag($id: ID!, $name: String!) {
    updateTag(id: $id, name: $name) {
      ...TagFragment
    }
  }
  ${tagFragment}
`;

export const updateTagTestsMutation = gql`
  mutation updateTagTests(
    $add_tag_id: ID
    $remove_tag_id: ID
    $test_ids: [ID!]
  ) {
    updateTagTests(
      add_tag_id: $add_tag_id
      remove_tag_id: $remove_tag_id
      test_ids: $test_ids
    ) {
      ...TagsForTestFragment
    }
  }
  ${tagsForTestFragment}
`;

export const updateTeamMutation = gql`
  mutation updateTeam(
    $alert_integration_id: String
    $alert_only_on_failure: Boolean
    $id: ID!
    $is_email_alert_enabled: Boolean
    $name: String
  ) {
    updateTeam(
      alert_integration_id: $alert_integration_id
      alert_only_on_failure: $alert_only_on_failure
      id: $id
      is_email_alert_enabled: $is_email_alert_enabled
      name: $name
    ) {
      ...TeamFragment
    }
  }
  ${teamFragment}
`;

export const updateTriggerMutation = gql`
  mutation updateTrigger(
    $deployment_branches: String
    $deployment_environment: String
    $deployment_integration_id: ID
    $deployment_preview_url: String
    $deployment_provider: DeploymentProvider
    $environment_id: ID
    $id: ID!
    $name: String
    $repeat_minutes: Int
    $tag_ids: [ID!]
  ) {
    updateTrigger(
      deployment_branches: $deployment_branches
      deployment_environment: $deployment_environment
      deployment_integration_id: $deployment_integration_id
      deployment_preview_url: $deployment_preview_url
      deployment_provider: $deployment_provider
      environment_id: $environment_id
      id: $id
      name: $name
      repeat_minutes: $repeat_minutes
      tag_ids: $tag_ids
    ) {
      ...TriggerFragment
    }
  }
  ${triggerFragment}
`;

export const updateUserMutation = gql`
  mutation updateUser($onboarded_at: String!) {
    updateUser(onboarded_at: $onboarded_at) {
      ...UserFragment
    }
  }
  ${userFragment}
`;

export const updateWolfMutation = gql`
  mutation updateWolf($name: String!, $user_id: ID!) {
    updateWolf(name: $name, user_id: $user_id) {
      ...WolfFragment
    }
  }
  ${wolfFragment}
`;
