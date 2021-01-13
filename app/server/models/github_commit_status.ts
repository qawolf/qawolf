import { db } from "../db";
import { GitHubCommitStatus, ModelOptions } from "../types";
import { cuid } from "../utils";

type CreateGitHubCommitStatus = {
  context: string;
  deployment_url: string;
  github_installation_id: number;
  group_id: string;
  owner: string;
  repo: string;
  sha: string;
  suite_id: string;
};

type UpdateGitHubCommitStatus = {
  completed_at: string;
  id: string;
};

export const createGitHubCommitStatus = async (
  options: CreateGitHubCommitStatus,
  { logger, trx }: ModelOptions
): Promise<GitHubCommitStatus> => {
  const log = logger.prefix("createGitHubCommitStatus");
  log.debug("suite", options.suite_id);

  const gitHubCommitStatus = {
    ...options,
    completed_at: null,
    id: cuid(),
  };
  await (trx || db)("github_commit_statuses").insert(gitHubCommitStatus);

  log.debug(`created ${gitHubCommitStatus.id}`);

  return gitHubCommitStatus;
};

export const findGitHubCommitStatusForSuite = async (
  suite_id: string,
  { trx }: ModelOptions
): Promise<GitHubCommitStatus | null> => {
  const gitHubCommitStatus = await (trx || db)("github_commit_statuses")
    .select("*")
    .where({ suite_id })
    .first();

  return gitHubCommitStatus || null;
};

export const updateGitHubCommitStatus = async (
  { completed_at, id }: UpdateGitHubCommitStatus,
  { logger, trx }: ModelOptions
): Promise<GitHubCommitStatus> => {
  const log = logger.prefix("updateGitHubCommitStatus");
  log.debug(id);

  const gitHubCommitStatus = await (trx || db)("github_commit_statuses")
    .select("*")
    .where({ id })
    .first();

  if (!gitHubCommitStatus) {
    log.error("not found", id);
    throw new Error(`commit status not found ${id}`);
  }

  const updates: Partial<GitHubCommitStatus> = {
    completed_at,
    updated_at: new Date().toISOString(),
  };
  await (trx || db)("github_commit_statuses").where({ id }).update(updates);

  log.debug("updated", updates);

  return { ...gitHubCommitStatus, ...updates };
};
