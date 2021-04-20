import { findIntegration } from "../../models/integration";
import { BaseGitHubFields, GitTree, ModelOptions } from "../../types";
import { GIT_TEST_FILE_EXTENSION } from "../../utils";
import { buildGitHubFields } from "./helpers";

type FindTestsForBranch = {
  branch: string;
  integrationId: string;
};

type FindTestsForBranchResult = {
  gitHubFields: BaseGitHubFields;
  tests: GitTree["tree"];
};

type FindTreeForBranch = BaseGitHubFields & {
  recursive?: "true";
  tree_sha: string;
};

const qawolfPath = "qawolf";

export const findTreeForBranch = async (
  { octokit, owner, recursive, repo, tree_sha }: FindTreeForBranch,
  options: ModelOptions
): Promise<GitTree | null> => {
  const log = options.logger.prefix("findTreeForBranch");
  log.debug("tree sha", tree_sha);

  const { data } = await octokit.git.getTree({
    owner,
    recursive,
    repo,
    tree_sha,
  });
  log.debug("sha", data.sha);

  return data;
};

export const findTestsForBranch = async (
  { branch, integrationId }: FindTestsForBranch,
  options: ModelOptions
): Promise<FindTestsForBranchResult> => {
  const log = options.logger.prefix("findTestsForBranch");

  const integration = await findIntegration(integrationId, options);
  const fields = await buildGitHubFields(integration, options);

  const tree = await findTreeForBranch(
    { ...fields, tree_sha: branch },
    options
  );

  const qawolfTree = tree.tree.find((t) => t.path === qawolfPath);
  if (!qawolfTree || !qawolfTree.sha) {
    log.debug(`qawolf path ${qawolfPath} not found (sha ${qawolfTree?.sha})`);
    return { gitHubFields: fields, tests: [] };
  }

  const files = await findTreeForBranch(
    { ...fields, recursive: "true", tree_sha: qawolfTree.sha },
    options
  );
  const tests = files.tree.filter(({ path }) => {
    return path.includes(GIT_TEST_FILE_EXTENSION);
  });

  log.debug(`found ${tests.length} tests`);

  return { gitHubFields: fields, tests };
};
