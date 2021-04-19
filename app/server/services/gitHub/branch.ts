import { Octokit } from "@octokit/rest";

import {
  BaseGitHubFields,
  GitHubBranch,
  Integration,
  ModelOptions,
} from "../../types";
import { createSyncInstallationAccessToken } from "./app";

export const findDefaultBranch = async (
  { octokit, owner, repo }: BaseGitHubFields,
  { logger }: ModelOptions
): Promise<string> => {
  const log = logger.prefix("findDefaultBranch");

  const { data } = await octokit.repos.get({ owner, repo });
  const defaultBranch = data.default_branch;

  log.debug("default branch", defaultBranch);

  return defaultBranch;
};

export const findBranchesForIntegration = async (
  integration: Integration,
  options: ModelOptions
): Promise<GitHubBranch[]> => {
  const log = options.logger.prefix("findBranchesForIntegration");

  const token = await createSyncInstallationAccessToken(
    integration.github_installation_id,
    options
  );
  const octokit = new Octokit({ auth: token });
  const [owner, repo] = integration.github_repo_name?.split("/");

  const defaultBranch = await findDefaultBranch(
    { octokit, owner, repo },
    options
  );
  const { data } = await octokit.repos.listBranches({ owner, repo });

  const branches = [defaultBranch, ...data.map((branch) => branch.name)];
  const uniqueBranches = Array.from(new Set(branches));
  uniqueBranches.sort();

  log.debug("found branches", uniqueBranches);

  return uniqueBranches.map((name) => {
    return {
      is_default: name === defaultBranch,
      name,
    };
  });
};
