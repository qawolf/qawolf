import { createGitHubSignInUrlResolver } from "./resolvers/auth";
import { editorResolver, saveEditorResolver } from "./resolvers/editor";
import { emailResolver, sendEmailResolver } from "./resolvers/email";
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
import {
  createGitHubIntegrationsResolver,
  gitHubBranchesResolver,
} from "./resolvers/github";
import {
  createGroupResolver,
  deleteGroupResolver,
  groupsResolver,
  updateGroupResolver,
} from "./resolvers/group";
import { integrationsResolver } from "./resolvers/integration";
import {
  acceptInviteResolver,
  createInvitesResolver,
  teamInvitesResolver,
} from "./resolvers/invite";
import { onboardingResolver } from "./resolvers/onboarding";
import {
  runCountResolver,
  statusCountsResolver,
  suiteRunsResolver,
  testHistoryResolver,
  updateRunResolver,
} from "./resolvers/run";
import { runnerResolver, updateRunnerResolver } from "./resolvers/runner";
import {
  createSlackIntegrationResolver,
  createSlackIntegrationUrlResolver,
  sendSlackUpdateResolver,
} from "./resolvers/slack";
import {
  createStripeCheckoutSessionResolver,
  createStripePortalSessionResolver,
} from "./resolvers/stripe";
import { createSubscriberResolver } from "./resolvers/subscriber";
import {
  createSuiteResolver,
  suiteResolver,
  suitesResolver,
} from "./resolvers/suite";
import { teamResolver, updateTeamResolver } from "./resolvers/team";
import {
  createTestResolver,
  deleteTestsResolver,
  testsResolver,
  testSummariesResolver,
  updateTestsGroupResolver,
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
import { updateWolfResolver, wolfResolver } from "./resolvers/wolf";

export const resolvers = {
  Team: {
    invites: teamInvitesResolver,
    users: teamUsersResolver,
  },
  Suite: {
    runs: suiteRunsResolver,
    status_counts: statusCountsResolver,
  },
  Mutation: {
    acceptInvite: acceptInviteResolver,
    createEnvironment: createEnvironmentResolver,
    createEnvironmentVariable: createEnvironmentVariableResolver,
    createGitHubIntegrations: createGitHubIntegrationsResolver,
    createGroup: createGroupResolver,
    createInvites: createInvitesResolver,
    createSignInUrl: createGitHubSignInUrlResolver,
    createSlackIntegration: createSlackIntegrationResolver,
    createSlackIntegrationUrl: createSlackIntegrationUrlResolver,
    createStripeCheckoutSession: createStripeCheckoutSessionResolver,
    createStripePortalSession: createStripePortalSessionResolver,
    createSubscriber: createSubscriberResolver,
    createSuite: createSuiteResolver,
    createTest: createTestResolver,
    createTrigger: createTriggerResolver,
    deleteEnvironment: deleteEnvironmentResolver,
    deleteEnvironmentVariable: deleteEnvironmentVariableResolver,
    deleteGroup: deleteGroupResolver,
    deleteTests: deleteTestsResolver,
    deleteTrigger: deleteTriggerResolver,
    saveEditor: saveEditorResolver,
    sendEmail: sendEmailResolver,
    sendLoginCode: sendLoginCodeResolver,
    sendSlackUpdate: sendSlackUpdateResolver,
    signInWithEmail: signInWithEmailResolver,
    signInWithGitHub: signInWithGitHubResolver,
    updateEnvironment: updateEnvironmentResolver,
    updateEnvironmentVariable: updateEnvironmentVariableResolver,
    updateGroup: updateGroupResolver,
    updateRun: updateRunResolver,
    updateRunner: updateRunnerResolver,
    updateTeam: updateTeamResolver,
    updateTestTriggers: updateTestTriggersResolver,
    updateTestsGroup: updateTestsGroupResolver,
    updateTrigger: updateTriggerResolver,
    updateUser: updateUserResolver,
    updateWolf: updateWolfResolver,
  },
  Query: {
    currentUser: currentUserResolver,
    editor: editorResolver,
    email: emailResolver,
    environments: environmentsResolver,
    environmentVariables: environmentVariablesResolver,
    gitHubBranches: gitHubBranchesResolver,
    groups: groupsResolver,
    integrations: integrationsResolver,
    onboarding: onboardingResolver,
    runner: runnerResolver,
    runCount: runCountResolver,
    suite: suiteResolver,
    suites: suitesResolver,
    team: teamResolver,
    testHistory: testHistoryResolver,
    testSummaries: testSummariesResolver,
    testTriggers: testTriggersResolver,
    tests: testsResolver,
    triggers: triggersResolver,
    wolf: wolfResolver,
  },
};
