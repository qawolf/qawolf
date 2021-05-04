import { uniq } from "lodash";

import { GitHubBranch, ModelOptions, Team } from "../../types";
import { createOctokitForIntegration } from "./app";

export const findBranchesForTeam = async (
  team: Team,
  options: ModelOptions
): Promise<GitHubBranch[]> => {
  const log = options.logger.prefix("findBranchesForIntegration");

  const octokitRepo = await createOctokitForIntegration(
    team.git_sync_integration_id,
    options
  );

  const defaultBranches = team.default_branches
    ? team.default_branches.split(",")
    : [];
  const { data } = await octokitRepo.octokit.pulls.list({
    ...octokitRepo,
    per_page: 100,
    state: "open",
  });

  const branches = uniq([
    ...defaultBranches,
    ...data.map((pull) => pull.head.ref),
  ]);
  branches.sort();

  log.debug("found branches", branches);

  return branches.map((name) => {
    return {
      is_default: defaultBranches.includes(name),
      name,
    };
  });
};
