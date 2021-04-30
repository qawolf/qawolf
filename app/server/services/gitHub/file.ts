import { ModelOptions, Test } from "../../types";
import { createOctokitForIntegration } from "./app";

type CreateFileForTest = {
  branch: string;
  integrationId: string;
  test: Test;
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
