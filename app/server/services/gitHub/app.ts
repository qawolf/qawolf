import { createAppAuth } from "@octokit/auth-app";
import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

import environment from "../../environment";
import { Logger } from "../../Logger";
import { findSystemEnvironmentVariable } from "../../models/environment_variable";
import {
  findGitHubCommitStatusForSuite,
  updateGitHubCommitStatus,
} from "../../models/github_commit_status";
import { findRunsForSuite } from "../../models/run";
import {
  GitHubCommitStatus as GitHubCommitStatusModel,
  ModelOptions,
} from "../../types";

export type GitHubCommitStatus = RestEndpointMethodTypes["repos"]["createCommitStatus"]["response"]["data"];

export type GitHubRepos = RestEndpointMethodTypes["apps"]["listReposAccessibleToInstallation"]["response"]["data"]["repositories"];

type CreateCommitStatus = {
  context: string;
  installationId: number;
  owner: string;
  repo: string;
  sha: string;
  state?: "failure" | "pending" | "success";
  suiteId: string;
};

type FindBranchesForCommit = {
  installationId: number;
  owner: string;
  repo: string;
  sha: string;
};

type FindGitHubReposForInstallation = {
  installationId: number;
  isSync?: boolean;
};

type ShouldUpdateCommitStatus = {
  gitHubCommitStatus: GitHubCommitStatusModel | null;
  logger: Logger;
};

export const createInstallationAccessToken = async (
  installationId: number,
  options: ModelOptions
): Promise<string> => {
  const privateKeyVariable = await findSystemEnvironmentVariable(
    "GITHUB_APP_PRIVATE_KEY",
    options
  );

  const auth = createAppAuth({
    appId: environment.GITHUB_APP_ID,
    clientId: environment.GITHUB_OAUTH_CLIENT_ID,
    clientSecret: environment.GITHUB_APP_CLIENT_SECRET,
    installationId,
    privateKey: JSON.parse(privateKeyVariable.value),
  });

  const { token } = await auth({ type: "installation" });

  return token;
};

export const createSyncInstallationAccessToken = async (
  installationId: number,
  options: ModelOptions
): Promise<string> => {
  const privateKeyVariable = await findSystemEnvironmentVariable(
    "GITHUB_SYNC_APP_PRIVATE_KEY",
    options
  );

  const auth = createAppAuth({
    appId: environment.GITHUB_SYNC_APP_ID,
    clientId: environment.GITHUB_OAUTH_CLIENT_ID,
    clientSecret: environment.GITHUB_SYNC_APP_CLIENT_SECRET,
    installationId,
    privateKey: JSON.parse(privateKeyVariable.value),
  });

  const { token } = await auth({ type: "installation" });

  return token;
};

export const createCommitStatus = async (
  {
    context,
    installationId,
    owner,
    repo,
    sha,
    state,
    suiteId,
  }: CreateCommitStatus,
  options: ModelOptions
): Promise<GitHubCommitStatus> => {
  const token = await createInstallationAccessToken(installationId, options);
  const octokit = new Octokit({ auth: token });

  let description = "Running";
  if (state === "failure") description = "Fail";
  if (state === "success") description = "Pass";

  const { data } = await octokit.repos.createCommitStatus({
    context,
    description,
    owner,
    repo,
    sha,
    state: state || "pending",
    target_url: new URL(`/suites/${suiteId}`, environment.APP_URL).href,
  });

  return data;
};

export const findBranchesForCommit = async (
  { installationId, owner, repo, sha }: FindBranchesForCommit,
  options: ModelOptions
): Promise<string[]> => {
  const token = await createInstallationAccessToken(installationId, options);
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.checks.listSuitesForRef({
    owner,
    ref: sha,
    repo,
  });

  return Array.from(new Set(data.check_suites.map((s) => s.head_branch)));
};

export const findGitHubReposForInstallation = async (
  { installationId, isSync }: FindGitHubReposForInstallation,
  options: ModelOptions
): Promise<GitHubRepos> => {
  const log = options.logger.prefix("findGitHubReposForInstallation");

  try {
    const token = isSync
      ? await createSyncInstallationAccessToken(installationId, options)
      : await createInstallationAccessToken(installationId, options);
    const octokit = new Octokit({ auth: token });

    const {
      data: { repositories },
    } = await octokit.apps.listReposAccessibleToInstallation();

    log.debug(
      `found ${repositories.length} repos for installation ${installationId}`
    );

    return repositories;
  } catch (error) {
    log.alert("error", error);
    throw new Error("Could not complete GitHub app installation");
  }
};

export const shouldUpdateCommitStatus = ({
  gitHubCommitStatus,
  logger,
}: ShouldUpdateCommitStatus): boolean => {
  const log = logger.prefix("shouldUpdateCommitStatus");

  if (!gitHubCommitStatus) {
    log.debug("false: no github commit status for suite");
    return false;
  }

  log.debug("true");
  return true;
};

export const updateCommitStatus = async (
  suite_id: string,
  { logger, db }: ModelOptions
): Promise<void> => {
  await db.transaction(async (trx) => {
    const gitHubCommitStatus = await findGitHubCommitStatusForSuite(suite_id, {
      db: trx,
      logger,
    });
    const runs = await findRunsForSuite(suite_id, { db: trx, logger });

    const shouldUpdate = shouldUpdateCommitStatus({
      gitHubCommitStatus,
      logger,
    });

    if (!shouldUpdate) return;

    const state = runs.some((r) => r.status === "fail") ? "failure" : "success";

    await createCommitStatus(
      {
        context: gitHubCommitStatus.context,
        installationId: gitHubCommitStatus.github_installation_id,
        owner: gitHubCommitStatus.owner,
        repo: gitHubCommitStatus.repo,
        sha: gitHubCommitStatus.sha,
        state,
        suiteId: suite_id,
      },
      { db: trx, logger }
    );

    await updateGitHubCommitStatus(
      { completed_at: new Date().toISOString(), id: gitHubCommitStatus.id },
      { db: trx, logger }
    );
  });
};
