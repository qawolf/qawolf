import { camelCase } from "lodash";

import { findIntegration } from "../../models/integration";
import { BaseGitHubFields, ModelOptions, Test } from "../../types";
import { buildGitHubFields } from "./helpers";

type CreateFileForTest = {
  branch: string;
  integrationId: string;
  test: Test;
};

type DeleteFile = BaseGitHubFields & {
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

  const integration = await findIntegration(integrationId, options);
  const { octokit, owner, repo } = await buildGitHubFields(
    integration,
    options
  );

  const path = `qawolf/${camelCase(test.name)}.test.js`;

  await octokit.repos.createOrUpdateFileContents({
    branch,
    content: Buffer.from(test.code).toString("base64"),
    message: `create ${path}`,
    owner,
    path,
    repo,
  });

  log.debug("created");
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
