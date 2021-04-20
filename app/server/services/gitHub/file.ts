import { BaseGitHubFields, ModelOptions } from "../../types";

type DeleteFile = BaseGitHubFields & {
  branch: string;
  path: string;
  sha: string;
};

export const deleteFile = async (
  { branch, octokit, owner, path, repo, sha }: DeleteFile,
  { logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("deleteFile");
  log.debug("path", path);

  await octokit.repos.deleteFile({
    branch,
    message: `delete ${path}`,
    owner,
    path: `qawolf/${path}`,
    repo,
    sha,
  });

  log.debug("deleted");
};
