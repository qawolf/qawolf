import { Octokit } from "@octokit/rest";
import { uniq } from "lodash";

import { GitHubBranch, Integration, ModelOptions } from "../../types";
import { createOctokitForInstallation, OctokitRepo } from "./app";

export const findDefaultBranch = async (
  { octokit, owner, repo }: OctokitRepo,
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

  const token = await createOctokitForInstallation(
    { installationId: integration.github_installation_id, isSync: true },
    options
  );
  const octokit = new Octokit({ auth: token });

  const [owner, repo] = integration.github_repo_name?.split("/");

  const defaultBranch = await findDefaultBranch(
    { octokit, owner, repo },
    options
  );
  const { data } = await octokit.repos.listBranches({ owner, repo });

  const branches = uniq([defaultBranch, ...data.map((branch) => branch.name)]);
  branches.sort();

  log.debug("found branches", branches);

  return branches.map((name) => {
    return {
      is_default: name === defaultBranch,
      name,
    };
  });
};
