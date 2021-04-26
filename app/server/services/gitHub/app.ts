import { createAppAuth } from "@octokit/auth-app";
import { graphql } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";

import environment from "../../environment";
import { findSystemEnvironmentVariable } from "../../models/environment_variable";
import { findIntegration } from "../../models/integration";
import { ModelOptions } from "../../types";

type InstallationOptions = {
  installationId: number;
  isSync?: boolean;
};

type OctokitResult = {
  octokit: Octokit;
  token: string;
};

type OctokitGraphqlRepo = {
  graphql: typeof graphql;
  owner: string;
  repo: string;
};

export type OctokitRepo = {
  octokit: Octokit;
  owner: string;
  repo: string;
};

export const createOctokitAuth = async (
  { installationId, isSync }: InstallationOptions,
  options: ModelOptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const privateKeyVariable = await findSystemEnvironmentVariable(
    isSync ? "GITHUB_SYNC_APP_PRIVATE_KEY" : "GITHUB_APP_PRIVATE_KEY",
    options
  );
  const clientSecretVariable = await findSystemEnvironmentVariable(
    isSync ? "GITHUB_SYNC_APP_CLIENT_SECRET" : "GITHUB_APP_CLIENT_SECRET",
    options
  );

  const appId = isSync
    ? environment.GITHUB_SYNC_APP_ID
    : environment.GITHUB_APP_ID;

  const auth = createAppAuth({
    appId,
    clientId: environment.GITHUB_OAUTH_CLIENT_ID,
    clientSecret: clientSecretVariable.value,
    installationId,
    privateKey: JSON.parse(privateKeyVariable.value),
  });

  return auth;
};

export const createOctokitForInstallation = async (
  { installationId, isSync }: InstallationOptions,
  options: ModelOptions
): Promise<OctokitResult> => {
  const auth = await createOctokitAuth({ installationId, isSync }, options);
  const { token } = await auth({ type: "installation" });
  const octokit = new Octokit({ auth: token });
  return { octokit, token };
};

export const createOctokitForIntegration = async (
  integrationId: string,
  options: ModelOptions
): Promise<OctokitRepo> => {
  const integration = await findIntegration(integrationId, options);

  const result = await createOctokitForInstallation(
    {
      installationId: integration.github_installation_id,
      isSync: integration.type === "github_sync",
    },
    options
  );

  const [owner, repo] = integration.github_repo_name?.split("/");
  return { ...result, owner, repo };
};

export const createOctokitGraphqlForIntegration = async (
  integrationId: string,
  options: ModelOptions
): Promise<OctokitGraphqlRepo> => {
  const integration = await findIntegration(integrationId, options);

  const auth = await createOctokitAuth(
    {
      installationId: integration.github_installation_id,
      isSync: integration.type === "github_sync",
    },
    options
  );

  const graphqlWithAuth = graphql.defaults({ request: { hook: auth.hook } });

  const [owner, repo] = integration.github_repo_name?.split("/");
  return { graphql: graphqlWithAuth, owner, repo };
};
