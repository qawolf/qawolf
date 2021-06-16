import { createGitHubSignInUrlResolver } from "./resolvers/auth";
import { commitEditorResolver } from "./resolvers/editor";
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
  deleteFileResolver,
  fileResolver,
  updateFileResolver,
} from "./resolvers/file";
import {
  createGitHubIntegrationsResolver,
  gitHubBranchesResolver,
} from "./resolvers/github";
import { integrationsResolver } from "./resolvers/integration";
import {
  acceptInviteResolver,
  createInvitesResolver,
  teamInvitesResolver,
} from "./resolvers/invite";
import { onboardingResolver } from "./resolvers/onboarding";
import {
  runCountResolver,
  runResolver,
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
import {
  createTagResolver,
  deleteTagResolver,
  tagsForTestsResolver,
  tagsForTriggerResolver,
  tagsResolver,
  updateTagResolver,
} from "./resolvers/tag";
import { updateTagTestsResolver } from "./resolvers/tag_test";
import {
  createTeamResolver,
  teamResolver,
  updateTeamResolver,
} from "./resolvers/team";
import {
  createTestResolver,
  deleteTestsResolver,
  testsResolver,
  testSummariesResolver,
} from "./resolvers/test";
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
  Trigger: {
    tags: tagsForTriggerResolver,
  },
  Suite: {
    runs: suiteRunsResolver,
    status_counts: statusCountsResolver,
  },
  Mutation: {
    acceptInvite: acceptInviteResolver,
    commitEditor: commitEditorResolver,
    createEnvironment: createEnvironmentResolver,
    createEnvironmentVariable: createEnvironmentVariableResolver,
    createGitHubIntegrations: createGitHubIntegrationsResolver,
    createInvites: createInvitesResolver,
    createSignInUrl: createGitHubSignInUrlResolver,
    createSlackIntegration: createSlackIntegrationResolver,
    createSlackIntegrationUrl: createSlackIntegrationUrlResolver,
    createStripeCheckoutSession: createStripeCheckoutSessionResolver,
    createStripePortalSession: createStripePortalSessionResolver,
    createSubscriber: createSubscriberResolver,
    createSuite: createSuiteResolver,
    createTag: createTagResolver,
    createTeam: createTeamResolver,
    createTest: createTestResolver,
    createTrigger: createTriggerResolver,
    deleteEnvironment: deleteEnvironmentResolver,
    deleteEnvironmentVariable: deleteEnvironmentVariableResolver,
    deleteFile: deleteFileResolver,
    deleteTag: deleteTagResolver,
    deleteTests: deleteTestsResolver,
    deleteTrigger: deleteTriggerResolver,
    sendEmail: sendEmailResolver,
    sendLoginCode: sendLoginCodeResolver,
    sendSlackUpdate: sendSlackUpdateResolver,
    signInWithEmail: signInWithEmailResolver,
    signInWithGitHub: signInWithGitHubResolver,
    updateEnvironment: updateEnvironmentResolver,
    updateEnvironmentVariable: updateEnvironmentVariableResolver,
    updateFile: updateFileResolver,
    updateRun: updateRunResolver,
    updateRunner: updateRunnerResolver,
    updateTag: updateTagResolver,
    updateTagTests: updateTagTestsResolver,
    updateTeam: updateTeamResolver,
    updateTrigger: updateTriggerResolver,
    updateUser: updateUserResolver,
    updateWolf: updateWolfResolver,
  },
  Query: {
    currentUser: currentUserResolver,
    email: emailResolver,
    environments: environmentsResolver,
    environmentVariables: environmentVariablesResolver,
    file: fileResolver,
    gitHubBranches: gitHubBranchesResolver,
    integrations: integrationsResolver,
    onboarding: onboardingResolver,
    run: runResolver,
    runner: runnerResolver,
    runCount: runCountResolver,
    suite: suiteResolver,
    suites: suitesResolver,
    tags: tagsResolver,
    tagsForTests: tagsForTestsResolver,
    team: teamResolver,
    testHistory: testHistoryResolver,
    testSummaries: testSummariesResolver,
    tests: testsResolver,
    triggers: triggersResolver,
    wolf: wolfResolver,
  },
};
