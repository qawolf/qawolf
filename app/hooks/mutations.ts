import { MutationTuple, useMutation } from "@apollo/client";
import noop from "lodash/noop";
import { NextRouter, useRouter } from "next/router";

import { buildTestsPath } from "../components/Dashboard/helpers";
import {
  acceptInviteMutation,
  commitEditorMutation,
  createEnvironmentMutation,
  createEnvironmentVariableMutation,
  createGitHubIntegrationsMutation,
  createInvitesMutation,
  createSignInUrlMutation,
  createSlackIntegrationMutation,
  createSlackIntegrationUrlMutation,
  createStripeCheckoutSessionMutation,
  createStripePortalSessionMutation,
  createSubscriberMutation,
  createSuiteMutation,
  createTagMutation,
  createTeamMutation,
  createTestMutation,
  createTriggerMutation,
  deleteEnvironmentMutation,
  deleteEnvironmentVariableMutation,
  deleteTagMutation,
  deleteTestsMutation,
  deleteTriggerMutation,
  sendLoginCodeMutation,
  sendSlackUpdateMutation,
  signInWithEmailMutation,
  signInWithGitHubMutation,
  updateEnvironmentMutation,
  updateEnvironmentVariableMutation,
  updateTagMutation,
  updateTagTestsMutation,
  updateTeamMutation,
  updateTriggerMutation,
  updateUserMutation,
  updateWolfMutation,
} from "../graphql/mutations";
import { currentUserQuery } from "../graphql/queries";
import { client, JWT_KEY } from "../lib/client";
import { routes } from "../lib/routes";
import { state } from "../lib/state";
import {
  AuthenticatedUser,
  Environment,
  EnvironmentVariable,
  File,
  Integration,
  Invite,
  State,
  Tag,
  TagsForTest,
  Team,
  Test,
  Trigger,
  TriggerFields,
  User,
  Wolf,
} from "../lib/types";
import { buildTestCode } from "../shared/utils";
import { useTagQuery } from "./tagQuery";

type AcceptInviteData = {
  acceptInvite: Invite;
};

type AcceptInviteVariables = {
  id: string;
};

type CommitEditorData = {
  helpers: File;
  test: File;
};

export type CommitEditorVariables = {
  branch: string;
  code?: string | null;
  helpers?: string | null;
  path?: string | null;
  test_id: string;
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
  is_sync: boolean;
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

type CreateStripeCheckoutSessionData = {
  createStripeCheckoutSession: string;
};

type CreateStripeCheckoutSessionVariables = {
  app_url: string;
  cancel_uri: string;
  team_id: string;
};

type CreateStripePortalSessionData = {
  createStripePortalSession: string;
};

type CreateStripePortalSessionVariables = {
  app_url: string;
  return_uri: string;
  team_id: string;
};

type CreateSubscriberData = {
  createSubscriber: boolean;
};

type CreateSubscriberVariables = {
  email: string;
};

type CreateSuiteData = {
  createSuite: string;
};

type CreateSuiteVariables = {
  branch: string | null;
  environment_id: string | null;
  environment_variables?: string | null;
  test_ids: string[];
};

type CreateTagData = {
  createTag: Tag;
};

type CreateTagVariables = {
  name: string;
  team_id: string;
  test_ids?: string[] | null;
};

type CreateTeamData = {
  createTeam: Team;
};

export type CreateTestData = {
  createTest: Test;
};

type CreateTestVariables = {
  branch?: string | null;
  guide?: string | null;
  team_id: string;
  url: string;
};

type CreateTriggerData = {
  createTrigger: Trigger;
};

export type CreateTriggerVariables = TriggerFields & {
  team_id: string;
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

type DeleteTagData = {
  deleteTag: Tag;
};

type DeleteTagVariables = {
  id: string;
};

type DeleteTestsData = {
  deleteTests: Test[];
};

type DeleteTestsVariables = {
  branch: string | null;
  ids: string[];
};

type DeleteTriggerData = {
  deleteTrigger: Trigger;
};

type DeleteTriggerVariables = {
  id: string;
};

type SendLoginCodeData = {
  sendLoginCode: {
    email: string;
  };
};

type SendLoginCodeVariables = {
  email: string;
  invite_id?: string | null;
  is_subscribed?: boolean;
};

type SendSlackUpdateData = {
  sendSlackUpdate: boolean;
};

type SendSlackUpdateVariables = {
  message: string;
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
  is_subscribed?: boolean;
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

type UpdateTagData = {
  updateTag: Tag;
};

type UpdateTagVariables = {
  id: string;
  name: string;
};

type UpdateTagTestsData = {
  updateTagTests: TagsForTest[];
};

type UpdateTagTestsVariables = {
  add_tag_id: string | null;
  remove_tag_id: string | null;
  test_ids: string[];
};

type UpdateTeamData = {
  updateTeam: Team;
};

type UpdateTeamVariables = {
  alert_integration_id?: string | null;
  alert_only_on_failure?: boolean;
  id: string;
  is_email_alert_enabled?: boolean;
  name?: string;
};

type UpdateTriggerData = {
  updateTrigger: Trigger;
};

type UpdateTriggerVariables = TriggerFields & {
  id: string;
};

type UpdateUserData = {
  updateUser: User;
};

type UpdateUserVariables = {
  onboarded_at: string;
};

type UpdateWolfData = {
  updateWolf: Wolf;
};

type UpdateWolfVariables = {
  name: string;
  user_id: string;
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

  let route = routes.tests;

  if (signUp.redirectUri) route = signUp.redirectUri;
  else if (!user.onboarded_at) route = routes.getStarted;

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

export const useCommitEditor = (): MutationTuple<
  CommitEditorData,
  CommitEditorVariables
> => {
  return useMutation<CommitEditorData, CommitEditorVariables>(
    commitEditorMutation,
    { onError }
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
  variables: CreateGitHubIntegrationsVariables
): MutationTuple<
  CreateGitHubIntegrationsData,
  CreateGitHubIntegrationsVariables
> => {
  return useMutation<
    CreateGitHubIntegrationsData,
    CreateGitHubIntegrationsVariables
  >(createGitHubIntegrationsMutation, { onError, variables });
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
      refetchQueries: ["onboarding", "team"],
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
  variables: CreateSlackIntegrationVariables
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
      replace(routes.settings);
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

export const useCreateStripeCheckoutSession = (): MutationTuple<
  CreateStripeCheckoutSessionData,
  CreateStripeCheckoutSessionVariables
> => {
  return useMutation<
    CreateStripeCheckoutSessionData,
    CreateStripeCheckoutSessionVariables
  >(createStripeCheckoutSessionMutation, { onError });
};

export const useCreateStripePortalSession = (): MutationTuple<
  CreateStripePortalSessionData,
  CreateStripePortalSessionVariables
> => {
  return useMutation<
    CreateStripePortalSessionData,
    CreateStripePortalSessionVariables
  >(createStripePortalSessionMutation, { onError });
};

export const useCreateSubscriber = (): MutationTuple<
  CreateSubscriberData,
  CreateSubscriberVariables
> => {
  return useMutation<CreateSubscriberData, CreateSubscriberVariables>(
    createSubscriberMutation,
    { onError }
  );
};

export const useCreateSuite = (): MutationTuple<
  CreateSuiteData,
  CreateSuiteVariables
> => {
  const { push } = useRouter();

  return useMutation<CreateSuiteData, CreateSuiteVariables>(
    createSuiteMutation,
    {
      onCompleted: (response) => {
        const { createSuite } = response || {};
        if (createSuite) push(`${routes.suites}/${createSuite}`);
      },
      onError,
      refetchQueries: ["dashboard"],
    }
  );
};

export const useCreateTag = (): MutationTuple<
  CreateTagData,
  CreateTagVariables
> => {
  return useMutation<CreateTagData, CreateTagVariables>(createTagMutation, {
    awaitRefetchQueries: true,
    onError,
    refetchQueries: ["tags", "tagsForTests"],
  });
};

export const useCreateTeam = (): MutationTuple<
  CreateTeamData,
  Record<string, never>
> => {
  return useMutation<CreateTeamData>(createTeamMutation, {
    awaitRefetchQueries: true,
    onCompleted: (response) => {
      // take user to new team
      const { createTeam } = response || {};
      if (!createTeam) return;

      state.setTeamId(createTeam.id);
    },
    onError,
    refetchQueries: ["currentUser"],
  });
};

export const useCreateTest = (
  callback?: (data: CreateTestData) => void
): MutationTuple<CreateTestData, CreateTestVariables> => {
  return useMutation<CreateTestData, CreateTestVariables>(createTestMutation, {
    onCompleted: (data: CreateTestData) => {
      const { code, url } = data.createTest;

      state.setPendingRun({
        code,
        // run the created test with a waitUntil: domcontentloaded so the user
        // does not need to wait for the load event to start creating the test
        code_to_run: buildTestCode(url, true),
        env: {},
        restart: true,
      });

      if (callback) callback(data);
    },
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
      onError,
      refetchQueries: ["onboarding", "triggers"],
    }
  );
};

export const useDeleteEnvironment = ({
  currentEnvironmentId,
}: {
  currentEnvironmentId: string | null;
}): MutationTuple<DeleteEnvironmentData, DeleteEnvironmentVariables> => {
  return useMutation<DeleteEnvironmentData, DeleteEnvironmentVariables>(
    deleteEnvironmentMutation,
    {
      awaitRefetchQueries: true,
      onCompleted: ({ deleteEnvironment }) => {
        if (!deleteEnvironment || deleteEnvironment.id !== currentEnvironmentId)
          return;
        // clear deleted environment from state
        state.setEnvironmentId(null);
      },
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

export const useDeleteTag = (): MutationTuple<
  DeleteTagData,
  DeleteTagVariables
> => {
  const { replace } = useRouter();
  const { filter, tagNames } = useTagQuery();

  return useMutation<DeleteTagData, DeleteTagVariables>(deleteTagMutation, {
    awaitRefetchQueries: true,
    // remove deleted tag from filter if needed
    onCompleted: (response) => {
      const tagName = response?.deleteTag?.name;
      if (!tagName || !tagNames.includes(tagName)) return;

      const newTagNames = [...tagNames];
      const index = newTagNames.indexOf(tagName);
      if (index > -1) newTagNames.splice(index, 1);

      replace(buildTestsPath(newTagNames, filter));
    },
    onError,
    refetchQueries: ["tags", "tagsForTests"],
  });
};

export const useDeleteTests = (
  variables: DeleteTestsVariables
): MutationTuple<DeleteTestsData, DeleteTestsVariables> => {
  return useMutation<DeleteTestsData, DeleteTestsVariables>(
    deleteTestsMutation,
    {
      awaitRefetchQueries: true,
      onError,
      refetchQueries: ["tests"],
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

export const useSendSlackUpdate = (): MutationTuple<
  SendSlackUpdateData,
  SendSlackUpdateVariables
> => {
  return useMutation<SendSlackUpdateData, SendSlackUpdateVariables>(
    sendSlackUpdateMutation,
    { onError }
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

export const useUpdateTag = (): MutationTuple<
  UpdateTagData,
  UpdateTagVariables
> => {
  return useMutation<UpdateTagData, UpdateTagVariables>(updateTagMutation, {
    onError,
    refetchQueries: ["tags"],
  });
};

export const useUpdateTagTests = (): MutationTuple<
  UpdateTagTestsData,
  UpdateTagTestsVariables
> => {
  return useMutation<UpdateTagTestsData, UpdateTagTestsVariables>(
    updateTagTestsMutation,
    { onError }
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

export const useUpdateTrigger = (): MutationTuple<
  UpdateTriggerData,
  UpdateTriggerVariables
> => {
  return useMutation<UpdateTriggerData, UpdateTriggerVariables>(
    updateTriggerMutation,
    { onError }
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

export const useUpdateWolf = (): MutationTuple<
  UpdateWolfData,
  UpdateWolfVariables
> => {
  return useMutation<UpdateWolfData, UpdateWolfVariables>(updateWolfMutation, {
    onError,
  });
};
