import { Octokit } from "@octokit/rest";

import { BaseGitHubFields, Integration, ModelOptions } from "../../types";
import { createSyncInstallationAccessToken } from "./app";

export const buildGitHubFields = async (
  integration: Integration,
  options: ModelOptions
): Promise<BaseGitHubFields> => {
  const token = await createSyncInstallationAccessToken(
    integration.github_installation_id,
    options
  );
  const octokit = new Octokit({ auth: token });
  const [owner, repo] = integration.github_repo_name?.split("/");

  return { octokit, owner, repo };
};
