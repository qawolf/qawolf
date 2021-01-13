import { createAppAuth } from "@octokit/auth-app";
import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

import { db } from "../../db";
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
  SuiteRun,
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
  logger: Logger;
};

type ShouldUpdateCommitStatus = {
  gitHubCommitStatus: GitHubCommitStatusModel | null;
  logger: Logger;
  runs: SuiteRun[];
};

type UpdateCommitStatusForSuite = {
  logger: Logger;
  suite_id: string;
};

export const createInstallationAccessToken = async (
  installationId: number
): Promise<string> => {
  const privateKeyVariable = await findSystemEnvironmentVariable(
    "GITHUB_APP_PRIVATE_KEY"
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

export const createCommitStatus = async ({
  context,
  installationId,
  owner,
  repo,
  sha,
  state,
  suiteId,
}: CreateCommitStatus): Promise<GitHubCommitStatus> => {
  const token = await createInstallationAccessToken(installationId);
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.repos.createCommitStatus({
    context,
    owner,
    repo,
    sha,
    state: state || "pending",
    target_url: new URL(`/tests/${suiteId}`, environment.APP_URL).href,
  });

  return data;
};

export const findBranchesForCommit = async ({
  installationId,
  owner,
  repo,
  sha,
}: FindBranchesForCommit): Promise<string[]> => {
  const token = await createInstallationAccessToken(installationId);
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.checks.listSuitesForRef({
    owner,
    ref: sha,
    repo,
  });

  return Array.from(new Set(data.check_suites.map((s) => s.head_branch)));
};

export const findGitHubReposForInstallation = async ({
  installationId,
  logger,
}: FindGitHubReposForInstallation): Promise<GitHubRepos> => {
  const log = logger.prefix("findGitHubReposForInstallation");

  try {
    const token = await createInstallationAccessToken(installationId);
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
  runs,
}: ShouldUpdateCommitStatus): boolean => {
  const log = logger.prefix("shouldUpdateCommitStatus");

  if (!gitHubCommitStatus) {
    log.debug("false: no github commit status for suite");
    return false;
  }

  if (runs.some((r) => r.status === "created")) {
    log.debug("false: suite not complete");
    return false;
  }

  log.debug("true");
  return true;
};

export const updateCommitStatus = async ({
  logger,
  suite_id,
}: UpdateCommitStatusForSuite): Promise<void> => {
  await db.transaction(async (trx) => {
    const gitHubCommitStatus = await findGitHubCommitStatusForSuite(suite_id, {
      logger,
      trx,
    });
    const runs = await findRunsForSuite(suite_id, { logger, trx });

    const shouldUpdate = shouldUpdateCommitStatus({
      gitHubCommitStatus,
      logger,
      runs,
    });

    if (!shouldUpdate) return;

    const state = runs.some((r) => r.status === "fail") ? "failure" : "success";

    await createCommitStatus({
      context: gitHubCommitStatus.context,
      installationId: gitHubCommitStatus.github_installation_id,
      owner: gitHubCommitStatus.owner,
      repo: gitHubCommitStatus.repo,
      sha: gitHubCommitStatus.sha,
      state,
      suiteId: suite_id,
    });

    await updateGitHubCommitStatus(
      { completed_at: new Date().toISOString(), id: gitHubCommitStatus.id },
      { logger, trx }
    );
  });
};
