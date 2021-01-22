import { MutationTuple, useMutation } from "@apollo/client";
import noop from "lodash/noop";
import { NextRouter, useRouter } from "next/router";

import {
  acceptInviteMutation,
  createApiKeyMutation,
  createEnvironmentVariableMutation,
  createGitHubIntegrationsMutation,
  createGroupMutation,
  createInvitesMutation,
  createSignInUrlMutation,
  createSlackIntegrationMutation,
  createSlackIntegrationUrlMutation,
  createSuiteMutation,
  createTestMutation,
  deleteApiKeyMutation,
  deleteEnvironmentVariableMutation,
  deleteGroupMutation,
  deleteTestsMutation,
  joinMailingListMutation,
  sendLoginCodeMutation,
  signInWithEmailMutation,
  signInWithGitHubMutation,
  updateGroupMutation,
  updateGroupTestsMutation,
  updateTeamMutation,
  updateTestMutation,
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
  EnvironmentVariable,
  Group,
  Integration,
  Invite,
  State,
  Team,
  Test,
  User,
} from "../lib/types";
import { updateIntercomUser } from "./intercom";

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

type CreateEnvironmentVariableData = {
  createEnvironmentVariable: EnvironmentVariable;
};

type CreateEnvironmentVariableVariables = {
  group_id: string;
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

type CreateGroupData = {
  createGroup: Group;
};

type CreateGroupVariables = {
  team_id: string;
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
  group_id: string;
  redirect_uri: string;
  slack_code: string;
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
  group_id: string;
  test_ids: string[];
};

type CreateTestData = {
  createTest: Test;
};

export type CreateTestVariables = {
  group_id?: string | null;
  url: string;
};

type DeleteApiKeyData = {
  deleteApiKey: ApiKey;
};

type DeleteApiKeyVariables = {
  id: string;
};

type DeleteEnvironmentVariableData = {
  deleteEnvironmentVariable: EnvironmentVariable;
};

type DeleteEnvironmentVariableVariables = {
  id: string;
};

type DeleteGroupData = {
  deleteGroup: {
    default_group_id: string;
    id: string;
  };
};

type DeleteGroupVariables = {
  id: string;
};

type DeleteTestsData = {
  deleteTests: Test[];
};

type DeleteTestsVariables = {
  ids: string[];
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

type UpdateGroupData = {
  updateGroup: Group;
};

type UpdateGroupVariables = {
  deployment_branches?: string | null;
  deployment_environment?: DeploymentEnvironment | null;
  deployment_integration_id?: string | null;
  id: string;
  is_email_enabled?: boolean;
  name?: string;
  alert_integration_id?: string | null;
  repeat_minutes?: number | null;
};

type UpdateGroupTestsData = {
  updateGroupTests: number;
};

export type UpdateGroupTestsVariables = {
  add_group_id: string | null;
  remove_group_id: string | null;
  test_ids: string[];
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
  updateIntercomUser(user.email);

  // redirect to stored redirect uri if possible
  if (signUp.redirectUri) {
    replace(signUp.redirectUri);
    return;
  }

  const route = user.onboarded_at ? routes.tests : routes.create;
  replace(route);
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

export const useCreateGroup = (): MutationTuple<
  CreateGroupData,
  CreateGroupVariables
> => {
  return useMutation<CreateGroupData, CreateGroupVariables>(
    createGroupMutation,
    {
      // cannot redirect to new group until group list loads
      awaitRefetchQueries: true,
      onCompleted: (response) => {
        const { createGroup } = response || {};
        if (!createGroup) return;

        state.setGroupId(createGroup.id);
      },
      onError,
      refetchQueries: ["groups"],
    }
  );
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
    refetchQueries: ["groups", "integrations"],
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

export const useDeleteApiKey = (): MutationTuple<
  DeleteApiKeyData,
  DeleteApiKeyVariables
> => {
  return useMutation<DeleteApiKeyData, DeleteApiKeyVariables>(
    deleteApiKeyMutation,
    { awaitRefetchQueries: true, onError, refetchQueries: ["apiKeys"] }
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

export const useDeleteGroup = (
  variables: DeleteGroupVariables
): MutationTuple<DeleteGroupData, DeleteGroupVariables> => {
  return useMutation<DeleteGroupData, DeleteGroupVariables>(
    deleteGroupMutation,
    {
      onCompleted: (response) => {
        const { deleteGroup } = response || {};
        if (!deleteGroup) return;
        // if viewing deleted group, redirect to all tests
        if (variables.id === deleteGroup.id) {
          state.setGroupId(deleteGroup.default_group_id);
        }
      },
      onError,
      refetchQueries: ["groups"],
      variables,
    }
  );
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

export const useUpdateGroup = (): MutationTuple<
  UpdateGroupData,
  UpdateGroupVariables
> => {
  return useMutation<UpdateGroupData, UpdateGroupVariables>(
    updateGroupMutation,
    { onError }
  );
};

export const useUpdateGroupTests = (): MutationTuple<
  UpdateGroupTestsData,
  UpdateGroupTestsVariables
> => {
  return useMutation<UpdateGroupTestsData, UpdateGroupTestsVariables>(
    updateGroupTestsMutation,
    { awaitRefetchQueries: true, onError, refetchQueries: ["dashboard"] }
  );
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

export const useUpdateUser = (): MutationTuple<
  UpdateUserData,
  UpdateUserVariables
> => {
  return useMutation<UpdateUserData, UpdateUserVariables>(updateUserMutation, {
    onError,
  });
};
