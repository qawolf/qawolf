import { ModelOptions, Test } from "../../types";
import { createOctokitForIntegration, OctokitRepo } from "./app";

type CreateFileForTest = {
  branch: string;
  integrationId: string;
  test: Test;
};

type DeleteFile = OctokitRepo & {
  branch: string;
  path: string;
  sha: string;
};

export const createFileForTest = async (
  { branch, integrationId, test }: CreateFileForTest,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("createFileForTest");
  log.debug("test", test.id, "branch", branch);

  const { octokit, owner, repo } = await createOctokitForIntegration(
    integrationId,
    options
  );

  await octokit.repos.createOrUpdateFileContents({
    branch,
    content: Buffer.from(test.code).toString("base64"),
    message: `create ${test.path}`,
    owner,
    path: test.path,
    repo,
  });

  log.debug("created");
};

export const deleteFile = async (
  { branch, octokit, owner, path, repo, sha }: DeleteFile,
  { logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("deleteFile");
  log.debug(`${owner}/${repo} branch ${branch} path ${path} sha ${sha}`);

  await octokit.repos.deleteFile({
    branch,
    message: `delete ${path}`,
    owner,
    path,
    repo,
    sha,
  });

  log.debug("deleted");
};
