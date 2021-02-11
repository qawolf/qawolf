import { MutationTuple, useMutation } from "@apollo/client";
import noop from "lodash/noop";
import { NextRouter, useRouter } from "next/router";

import {
  acceptInviteMutation,
  createApiKeyMutation,
  createEnvironmentMutation,
  createEnvironmentVariableMutation,
  createGitHubIntegrationsMutation,
  createInvitesMutation,
  createSignInUrlMutation,
  createSlackIntegrationMutation,
  createSlackIntegrationUrlMutation,
  createSuiteMutation,
  createTestMutation,
  createTriggerMutation,
  deleteApiKeyMutation,
  deleteEnvironmentMutation,
  deleteEnvironmentVariableMutation,
  deleteTestsMutation,
  deleteTriggerMutation,
  joinMailingListMutation,
  sendLoginCodeMutation,
  signInWithEmailMutation,
  signInWithGitHubMutation,
  updateEnvironmentMutation,
  updateEnvironmentVariableMutation,
  updateTeamMutation,
  updateTestMutation,
  updateTestTriggersMutation,
  updateTriggerMutation,
  updateUserMutation,
} from "../graphql/mutations";
import { currentUserQuery } from "../graphql/queries";
import { client, JWT_KEY } from "../lib/client";
import { routes } from "../lib/routes";
import { state } from "../lib/state";
import {
  ApiKey,
  AuthenticatedUser,
  DeploymentEnvironment,
  Environment,
  EnvironmentVariable,
  Integration,
  Invite,
  State,
  Team,
  Test,
  Trigger,
  User,
} from "../lib/types";

type AcceptInviteData = {
  acceptInvite: Invite;
};

type AcceptInviteVariables = {
  id: string;
};

type CreateApiKeyData = {
  createApiKey: ApiKey;
};

type CreateApiKeyVariables = {
  name: string;
  team_id: string;
};

type CreateEnvironmentData = {
  createEnvironment: Environment;
};

type CreateEnvironmentVariables = {
  name: string;
  team_id: string;
};

type CreateEnvironmentVariableData = {
  createEnvironmentVariable: EnvironmentVariable;
};

type CreateEnvironmentVariableVariables = {
  environment_id: string;
  name: string;
  value: string;
};

type CreateGitHubIntegrationsVariables = {
  installation_id: number;
  team_id: string;
};

type CreateGitHubIntegrationsData = {
  createGitHubIntegrations: Integration[];
};

type CreateInvitesData = {
  createInvites: Invite[];
};

type CreateInvitesVariables = {
  emails: string[];
  team_id: string;
};

type CreateSignInUrlData = {
  createSignInUrl: string;
};

type CreateSignInUrlVariables = {
  redirect_uri: string;
};

type CreateSlackIntegrationData = {
  createSlackIntegration: Integration;
};

type CreateSlackIntegrationVariables = {
  redirect_uri: string;
  slack_code: string;
  team_id: string;
};

type CreateSlackIntegrationUrlData = {
  createSlackIntegrationUrl: string;
};

type CreateSlackIntegrationUrlVariables = {
  redirect_uri: string;
};

type CreateSuiteData = {
  createSuite: string;
};

type CreateSuiteVariables = {
  test_ids: string[];
  trigger_id: string;
};

type CreateTestData = {
  createTest: Test;
};

type CreateTestVariables = {
  trigger_id?: string | null;
  url: string;
};

type CreateTriggerData = {
  createTrigger: Trigger;
};

export type CreateTriggerVariables = {
  environment_id?: string | null;
  name: string;
  repeat_minutes?: number | null;
  team_id: string;
  test_ids?: string[] | null;
};

type DeleteApiKeyData = {
  deleteApiKey: ApiKey;
};

type DeleteApiKeyVariables = {
  id: string;
};

type DeleteEnvironmentData = {
  deleteEnvironment: Environment;
};

type DeleteEnvironmentVariables = {
  id: string;
};

type DeleteEnvironmentVariableData = {
  deleteEnvironmentVariable: EnvironmentVariable;
};

type DeleteEnvironmentVariableVariables = {
  id: string;
};

type DeleteTestsData = {
  deleteTests: Test[];
};

type DeleteTestsVariables = {
  ids: string[];
};

type DeleteTriggerData = {
  deleteTrigger: {
    default_trigger_id: string;
    id: string;
  };
};

type DeleteTriggerVariables = {
  id: string;
};

type JoinMailingListData = {
  joinMailingList: boolean;
};

type JoinMailingListVariables = {
  email: string;
};

type SendLoginCodeData = {
  sendLoginCode: {
    email: string;
  };
};

type SendLoginCodeVariables = {
  email: string;
  invite_id?: string | null;
};

type SignInWithEmailData = {
  signInWithEmail: AuthenticatedUser;
};

type SignInWithEmailVariables = {
  email: string;
  login_code: string;
};

type SignInWithGitHubData = {
  signInWithGitHub: AuthenticatedUser;
};

type SignInWithGitHubVariables = {
  github_code: string;
  github_state: string;
  invite_id?: string | null;
};

type UpdateEnvironmentData = {
  updateEnvironment: Environment;
};

type UpdateEnvironmentVariables = {
  id: string;
  name: string;
};

type UpdateEnvironmentVariableData = {
  updateEnvironmentVariable: EnvironmentVariable;
};

type UpdateEnvironmentVariableVariables = {
  id: string;
  name: string;
  value: string;
};

type UpdateTeamData = {
  updateTeam: Team;
};

type UpdateTeamVariables = {
  helpers?: string;
  id: string;
  name?: string;
};

type UpdateTestData = {
  updateTest: Test;
};

type UpdateTestVariables = {
  id: string;
  code?: string;
  is_enabled?: boolean;
  name?: string;
  version?: number;
};

type UpdateTestTriggersData = {
  updateTestTriggers: number;
};

export type UpdateTestTriggersVariables = {
  add_trigger_id: string | null;
  remove_trigger_id: string | null;
  test_ids: string[];
};

type UpdateTriggerData = {
  updateTrigger: Trigger;
};

type UpdateTriggerVariables = {
  deployment_branches?: string | null;
  deployment_environment?: DeploymentEnvironment | null;
  deployment_integration_id?: string | null;
  environment_id?: string | null;
  id: string;
  name?: string;
  repeat_minutes?: number | null;
};

type UpdateUserData = {
  updateUser: User;
};

type UpdateUserVariables = {
  onboarded_at: string;
};

const onError = noop;

const updateCurrentUser = (currentUser: User): void => {
  client.writeQuery({
    query: currentUserQuery,
    data: {
      currentUser,
    },
  });
};

const handleAuthenticatedUser = ({
  data,
  replace,
  signUp,
}: {
  data: AuthenticatedUser;
  replace: NextRouter["replace"];
  signUp: State["signUp"];
}): void => {
  const { access_token, user } = data;

  localStorage.setItem(JWT_KEY, access_token);
  updateCurrentUser(user);

  // redirect to stored redirect uri if possible
  if (signUp.redirectUri) {
    replace(signUp.redirectUri);
    return;
  }

  replace(routes.tests);
};

export const useAcceptInvite = (): MutationTuple<
  AcceptInviteData,
  AcceptInviteVariables
> => {
  return useMutation<AcceptInviteData, AcceptInviteVariables>(
    acceptInviteMutation,
    {
      // need to wait for teams to update on current user after accepting invite
      awaitRefetchQueries: true,
      onCompleted: (response) => {
        const { acceptInvite } = response || {};
        if (!acceptInvite) return;
        // update selected team id to new team
        state.setTeamId(acceptInvite.team_id);
      },
      onError,
      refetchQueries: ["currentUser"],
    }
  );
};

export const useCreateApiKey = (): MutationTuple<
  CreateApiKeyData,
  CreateApiKeyVariables
> => {
  return useMutation<CreateApiKeyData, CreateApiKeyVariables>(
    createApiKeyMutation,
    { awaitRefetchQueries: true, onError, refetchQueries: ["apiKeys"] }
  );
};

export const useCreateEnvironment = (): MutationTuple<
  CreateEnvironmentData,
  CreateEnvironmentVariables
> => {
  return useMutation<CreateEnvironmentData, CreateEnvironmentVariables>(
    createEnvironmentMutation,
    {
      awaitRefetchQueries: true,
      onError,
      refetchQueries: ["environments"],
    }
  );
};

export const useCreateEnvironmentVariable = (): MutationTuple<
  CreateEnvironmentVariableData,
  CreateEnvironmentVariableVariables
> => {
  return useMutation<
    CreateEnvironmentVariableData,
    CreateEnvironmentVariableVariables
  >(createEnvironmentVariableMutation, {
    awaitRefetchQueries: true,
    onError,
    refetchQueries: ["environmentVariables"],
  });
};

export const useCreateGitHubIntegrations = (
  variables: CreateGitHubIntegrationsVariables,
  { dashboardUri }: { dashboardUri: string }
): MutationTuple<
  CreateGitHubIntegrationsData,
  CreateGitHubIntegrationsVariables
> => {
  const { replace } = useRouter();

  return useMutation<
    CreateGitHubIntegrationsData,
    CreateGitHubIntegrationsVariables
  >(createGitHubIntegrationsMutation, {
    awaitRefetchQueries: true,
    onCompleted: (response) => {
      if (!response) return;
      replace(dashboardUri || routes.tests);
    },
    onError,
    refetchQueries: ["integrations"],
    variables,
  });
};

export const useCreateInvites = (): MutationTuple<
  CreateInvitesData,
  CreateInvitesVariables
> => {
  return useMutation<CreateInvitesData, CreateInvitesVariables>(
    createInvitesMutation,
    {
      awaitRefetchQueries: true,
      onError,
      refetchQueries: ["team"],
    }
  );
};

export const useCreateSignInUrl = (
  variables: CreateSignInUrlVariables
): MutationTuple<CreateSignInUrlData, CreateSignInUrlVariables> => {
  return useMutation<CreateSignInUrlData, CreateSignInUrlVariables>(
    createSignInUrlMutation,
    { onError, variables }
  );
};

export const useCreateSlackIntegration = (
  variables: CreateSlackIntegrationVariables,
  { dashboardUri }: { dashboardUri: string }
): MutationTuple<
  CreateSlackIntegrationData,
  CreateSlackIntegrationVariables
> => {
  const { replace } = useRouter();

  return useMutation<
    CreateSlackIntegrationData,
    CreateSlackIntegrationVariables
  >(createSlackIntegrationMutation, {
    awaitRefetchQueries: true,
    onCompleted: (response) => {
      if (!response) return;
      replace(dashboardUri || routes.tests);
    },
    onError,
    refetchQueries: ["integrations", "team"],
    variables,
  });
};

export const useCreateSlackIntegrationUrl = (
  variables: CreateSlackIntegrationUrlVariables
): MutationTuple<
  CreateSlackIntegrationUrlData,
  CreateSlackIntegrationUrlVariables
> => {
  return useMutation<
    CreateSlackIntegrationUrlData,
    CreateSlackIntegrationUrlVariables
  >(createSlackIntegrationUrlMutation, { onError, variables });
};

export const useCreateSuite = (): MutationTuple<
  CreateSuiteData,
  CreateSuiteVariables
> => {
  return useMutation<CreateSuiteData, CreateSuiteVariables>(
    createSuiteMutation,
    {
      onError,
      refetchQueries: ["dashboard"],
    }
  );
};

export const useCreateTest = (): MutationTuple<
  CreateTestData,
  CreateTestVariables
> => {
  return useMutation<CreateTestData, CreateTestVariables>(createTestMutation, {
    onError,
    refetchQueries: ["tests"],
  });
};

export const useCreateTrigger = (): MutationTuple<
  CreateTriggerData,
  CreateTriggerVariables
> => {
  return useMutation<CreateTriggerData, CreateTriggerVariables>(
    createTriggerMutation,
    {
      // cannot redirect to new trigger until trigger list loads
      awaitRefetchQueries: true,
      onCompleted: (response) => {
        const { createTrigger } = response || {};
        if (!createTrigger) return;

        state.setTriggerId(createTrigger.id);
      },
      onError,
      refetchQueries: ["testTriggers", "triggers"],
    }
  );
};

export const useDeleteApiKey = (): MutationTuple<
  DeleteApiKeyData,
  DeleteApiKeyVariables
> => {
  return useMutation<DeleteApiKeyData, DeleteApiKeyVariables>(
    deleteApiKeyMutation,
    { awaitRefetchQueries: true, onError, refetchQueries: ["apiKeys"] }
  );
};

export const useDeleteEnvironment = (): MutationTuple<
  DeleteEnvironmentData,
  DeleteEnvironmentVariables
> => {
  return useMutation<DeleteEnvironmentData, DeleteEnvironmentVariables>(
    deleteEnvironmentMutation,
    {
      awaitRefetchQueries: true,
      onError,
      refetchQueries: ["environments"],
    }
  );
};

export const useDeleteEnvironmentVariable = (): MutationTuple<
  DeleteEnvironmentVariableData,
  DeleteEnvironmentVariableVariables
> => {
  return useMutation<
    DeleteEnvironmentVariableData,
    DeleteEnvironmentVariableVariables
  >(deleteEnvironmentVariableMutation, {
    awaitRefetchQueries: true,
    onError,
    refetchQueries: ["environmentVariables"],
  });
};

export const useDeleteTests = (
  variables: DeleteTestsVariables
): MutationTuple<DeleteTestsData, DeleteTestsVariables> => {
  return useMutation<DeleteTestsData, DeleteTestsVariables>(
    deleteTestsMutation,
    {
      onError,
      refetchQueries: ["dashboard"],
      variables,
    }
  );
};

export const useDeleteTrigger = (): MutationTuple<
  DeleteTriggerData,
  DeleteTriggerVariables
> => {
  return useMutation<DeleteTriggerData, DeleteTriggerVariables>(
    deleteTriggerMutation,
    {
      awaitRefetchQueries: true,
      onError,
      refetchQueries: ["triggers"],
    }
  );
};

export const useJoinMailingList = (): MutationTuple<
  JoinMailingListData,
  JoinMailingListVariables
> => {
  return useMutation<JoinMailingListData, JoinMailingListVariables>(
    joinMailingListMutation,
    { onError }
  );
};

export const useSendLoginCode = (): MutationTuple<
  SendLoginCodeData,
  SendLoginCodeVariables
> => {
  const { replace } = useRouter();

  return useMutation<SendLoginCodeData, SendLoginCodeVariables>(
    sendLoginCodeMutation,
    {
      onCompleted: (response) => {
        const { sendLoginCode } = response || {};
        if (!sendLoginCode) return;

        state.setEmail(sendLoginCode.email);
        // clear modal, redirect to confirm code page
        state.setModal({ name: null });
        replace(routes.confirmEmail);
      },
      onError,
    }
  );
};

export const useSignInWithEmail = ({
  signUp,
}: {
  signUp: State["signUp"];
}): MutationTuple<SignInWithEmailData, SignInWithEmailVariables> => {
  const { replace } = useRouter();

  return useMutation<SignInWithEmailData, SignInWithEmailVariables>(
    signInWithEmailMutation,
    {
      onCompleted: (response) => {
        const { signInWithEmail } = response || {};
        if (!signInWithEmail) return;

        handleAuthenticatedUser({
          data: signInWithEmail,
          replace,
          signUp,
        });
      },
      onError,
    }
  );
};

export const useSignInWithGitHub = (
  variables: SignInWithGitHubVariables,
  { signUp }: { signUp: State["signUp"] }
): MutationTuple<SignInWithGitHubData, SignInWithGitHubVariables> => {
  const { replace } = useRouter();

  return useMutation<SignInWithGitHubData, SignInWithGitHubVariables>(
    signInWithGitHubMutation,
    {
      onCompleted: (response) => {
        const { signInWithGitHub } = response || {};
        if (!signInWithGitHub) return;

        handleAuthenticatedUser({
          data: signInWithGitHub,
          replace,
          signUp,
        });
      },
      onError,
      variables: {
        ...variables,
        invite_id: signUp.inviteId,
      },
    }
  );
};

export const useUpdateEnvironment = (): MutationTuple<
  UpdateEnvironmentData,
  UpdateEnvironmentVariables
> => {
  return useMutation<UpdateEnvironmentData, UpdateEnvironmentVariables>(
    updateEnvironmentMutation,
    { onError, refetchQueries: ["environments"] }
  );
};

export const useUpdateEnvironmentVariable = (): MutationTuple<
  UpdateEnvironmentVariableData,
  UpdateEnvironmentVariableVariables
> => {
  return useMutation<
    UpdateEnvironmentVariableData,
    UpdateEnvironmentVariableVariables
  >(updateEnvironmentVariableMutation, {
    awaitRefetchQueries: true,
    onError,
    refetchQueries: ["environmentVariables"],
  });
};

export const useUpdateTeam = (): MutationTuple<
  UpdateTeamData,
  UpdateTeamVariables
> => {
  return useMutation<UpdateTeamData, UpdateTeamVariables>(updateTeamMutation, {
    onError,
  });
};

export const useUpdateTest = (): MutationTuple<
  UpdateTestData,
  UpdateTestVariables
> => {
  return useMutation<UpdateTestData, UpdateTestVariables>(updateTestMutation, {
    onError,
  });
};

export const useUpdateTestTriggers = (): MutationTuple<
  UpdateTestTriggersData,
  UpdateTestTriggersVariables
> => {
  return useMutation<UpdateTestTriggersData, UpdateTestTriggersVariables>(
    updateTestTriggersMutation,
    { awaitRefetchQueries: true, onError, refetchQueries: ["testTriggers"] }
  );
};

export const useUpdateTrigger = (): MutationTuple<
  UpdateTriggerData,
  UpdateTriggerVariables
> => {
  return useMutation<UpdateTriggerData, UpdateTriggerVariables>(
    updateTriggerMutation,
    { awaitRefetchQueries: true, onError, refetchQueries: ["triggers"] }
  );
};

export const useUpdateUser = (): MutationTuple<
  UpdateUserData,
  UpdateUserVariables
> => {
  return useMutation<UpdateUserData, UpdateUserVariables>(updateUserMutation, {
    onError,
  });
};
