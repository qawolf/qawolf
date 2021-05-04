import { uniq } from "lodash";

import { GitHubBranch, ModelOptions } from "../../types";
import { createOctokitForIntegration, OctokitRepo } from "./app";

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
  integrationId: string,
  options: ModelOptions
): Promise<GitHubBranch[]> => {
  const log = options.logger.prefix("findBranchesForIntegration");

  const octokitRepo = await createOctokitForIntegration(integrationId, options);

  const defaultBranch = await findDefaultBranch(octokitRepo, options);

  const { data } = await octokitRepo.octokit.pulls.list({
    ...octokitRepo,
    per_page: 100,
    state: "open",
  });

  const branches = uniq([defaultBranch, ...data.map((pull) => pull.head.ref)]);
  branches.sort();

  log.debug("found branches", branches);

  return branches.map((name) => {
    return {
      is_default: name === defaultBranch,
      name,
    };
  });
};
