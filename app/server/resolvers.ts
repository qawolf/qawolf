import { createGitHubSignInUrlResolver } from "./resolvers/auth";
import { emailResolver } from "./resolvers/email";
import {
  createEnvironmentResolver,
  deleteEnvironmentResolver,
  environmentsResolver,
  updateEnvironmentResolver,
} from "./resolvers/environment";
import {
  createEnvironmentVariableResolver,
  deleteEnvironmentVariableResolver,
  environmentVariablesResolver,
  updateEnvironmentVariableResolver,
} from "./resolvers/environment_variable";
import { createGitHubIntegrationsResolver } from "./resolvers/github";
import { integrationsResolver } from "./resolvers/integration";
import {
  acceptInviteResolver,
  createInvitesResolver,
  teamInvitesResolver,
} from "./resolvers/invite";
import {
  suiteRunsResolver,
  testHistoryResolver,
  updateRunResolver,
} from "./resolvers/run";
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
  testSummariesResolver,
  updateTestResolver,
} from "./resolvers/test";
import {
  testTriggersResolver,
  updateTestTriggersResolver,
} from "./resolvers/test_trigger";
import {
  createTriggerResolver,
  deleteTriggerResolver,
  triggersResolver,
  updateTriggerResolver,
} from "./resolvers/trigger";
import {
  currentUserResolver,
  sendLoginCodeResolver,
  signInWithEmailResolver,
  signInWithGitHubResolver,
  teamUsersResolver,
  updateUserResolver,
} from "./resolvers/user";

export const resolvers = {
  Team: {
    invites: teamInvitesResolver,
    users: teamUsersResolver,
  },
  Suite: {
    runs: suiteRunsResolver,
  },
  Mutation: {
    acceptInvite: acceptInviteResolver,
    createEnvironment: createEnvironmentResolver,
    createEnvironmentVariable: createEnvironmentVariableResolver,
    createGitHubIntegrations: createGitHubIntegrationsResolver,
    createInvites: createInvitesResolver,
    createSignInUrl: createGitHubSignInUrlResolver,
    createSlackIntegration: createSlackIntegrationResolver,
    createSlackIntegrationUrl: createSlackIntegrationUrlResolver,
    createSuite: createSuiteResolver,
    createTest: createTestResolver,
    createTrigger: createTriggerResolver,
    deleteEnvironment: deleteEnvironmentResolver,
    deleteEnvironmentVariable: deleteEnvironmentVariableResolver,
    deleteTests: deleteTestsResolver,
    deleteTrigger: deleteTriggerResolver,
    joinMailingList: joinMailingListResolver,
    sendLoginCode: sendLoginCodeResolver,
    signInWithEmail: signInWithEmailResolver,
    signInWithGitHub: signInWithGitHubResolver,
    updateEnvironment: updateEnvironmentResolver,
    updateEnvironmentVariable: updateEnvironmentVariableResolver,
    updateRun: updateRunResolver,
    updateRunner: updateRunnerResolver,
    updateTeam: updateTeamResolver,
    updateTest: updateTestResolver,
    updateTestTriggers: updateTestTriggersResolver,
    updateTrigger: updateTriggerResolver,
    updateUser: updateUserResolver,
  },
  Query: {
    currentUser: currentUserResolver,
    email: emailResolver,
    environments: environmentsResolver,
    environmentVariables: environmentVariablesResolver,
    integrations: integrationsResolver,
    runner: runnerResolver,
    suite: suiteResolver,
    team: teamResolver,
    test: testResolver,
    testHistory: testHistoryResolver,
    testSummaries: testSummariesResolver,
    testTriggers: testTriggersResolver,
    tests: testsResolver,
    triggers: triggersResolver,
  },
};
