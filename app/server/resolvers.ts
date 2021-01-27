import {
  apiKeysResolver,
  createApiKeyResolver,
  deleteApiKeyResolver,
} from "./resolvers/api_key";
import { createGitHubSignInUrlResolver } from "./resolvers/auth";
import { dashboardResolver } from "./resolvers/dashboard";
import {
  environmentsResolver,
  updateEnvironmentResolver,
} from "./resolvers/environment";
import {
  createEnvironmentVariableResolver,
  deleteEnvironmentVariableResolver,
  environmentVariablesResolver,
} from "./resolvers/environment_variable";
import { createGitHubIntegrationsResolver } from "./resolvers/github";
import {
  createGroupResolver,
  deleteGroupResolver,
  groupsResolver,
  testGroupsResolver,
  updateGroupResolver,
} from "./resolvers/group";
import { updateGroupTestsResolver } from "./resolvers/group_test";
import { integrationsResolver } from "./resolvers/integration";
import {
  acceptInviteResolver,
  createInvitesResolver,
  teamInvitesResolver,
} from "./resolvers/invite";
import { suiteRunsResolver, updateRunResolver } from "./resolvers/run";
import { runnerResolver, updateRunnerResolver } from "./resolvers/runner";
import { joinMailingListResolver } from "./resolvers/sendgrid";
import {
  createSlackIntegrationResolver,
  createSlackIntegrationUrlResolver,
} from "./resolvers/slack";
import {
  createSuiteResolver,
  suiteResolver,
  suitesResolver,
} from "./resolvers/suite";
import { teamResolver, updateTeamResolver } from "./resolvers/team";
import {
  createTestResolver,
  deleteTestsResolver,
  testResolver,
  testsResolver,
  testSummaryResolver,
  updateTestResolver,
} from "./resolvers/test";
import {
  currentUserResolver,
  sendLoginCodeResolver,
  signInWithEmailResolver,
  signInWithGitHubResolver,
  teamUsersResolver,
  updateUserResolver,
} from "./resolvers/user";

export const resolvers = {
  Dashboard: {
    suites: suitesResolver,
    tests: testsResolver,
  },
  Team: {
    invites: teamInvitesResolver,
    users: teamUsersResolver,
  },
  Test: {
    groups: testGroupsResolver,
    summary: testSummaryResolver,
  },
  Suite: {
    runs: suiteRunsResolver,
  },
  Mutation: {
    acceptInvite: acceptInviteResolver,
    createApiKey: createApiKeyResolver,
    createGitHubIntegrations: createGitHubIntegrationsResolver,
    createGroup: createGroupResolver,
    createEnvironmentVariable: createEnvironmentVariableResolver,
    createInvites: createInvitesResolver,
    createSignInUrl: createGitHubSignInUrlResolver,
    createSlackIntegration: createSlackIntegrationResolver,
    createSlackIntegrationUrl: createSlackIntegrationUrlResolver,
    createSuite: createSuiteResolver,
    createTest: createTestResolver,
    deleteApiKey: deleteApiKeyResolver,
    deleteEnvironmentVariable: deleteEnvironmentVariableResolver,
    deleteGroup: deleteGroupResolver,
    deleteTests: deleteTestsResolver,
    joinMailingList: joinMailingListResolver,
    sendLoginCode: sendLoginCodeResolver,
    signInWithEmail: signInWithEmailResolver,
    signInWithGitHub: signInWithGitHubResolver,
    updateEnvironment: updateEnvironmentResolver,
    updateGroup: updateGroupResolver,
    updateGroupTests: updateGroupTestsResolver,
    updateRun: updateRunResolver,
    updateRunner: updateRunnerResolver,
    updateTeam: updateTeamResolver,
    updateTest: updateTestResolver,
    updateUser: updateUserResolver,
  },
  Query: {
    apiKeys: apiKeysResolver,
    currentUser: currentUserResolver,
    dashboard: dashboardResolver,
    environments: environmentsResolver,
    environmentVariables: environmentVariablesResolver,
    groups: groupsResolver,
    integrations: integrationsResolver,
    runner: runnerResolver,
    suite: suiteResolver,
    team: teamResolver,
    test: testResolver,
  },
};
