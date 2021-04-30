import { uniq } from "lodash";

import { ClientError } from "../errors";
import { BLOB_MODE, createCommit } from "../services/gitHub/sync";
import { findTestsForBranch } from "../services/gitHub/tree";
import { GitHubFile, ModelOptions, Team, Test } from "../types";
import { createTest } from "./test";

type CreateMissingTests = {
  gitHubTests: GitHubFile[];
  team_id: string;
  tests: Test[];
};

type DeleteGitHubTests = {
  branch: string;
  teams: Team[];
  tests: Test[];
};

type UpsertGitHubTests = {
  branch: string;
  integrationId: string;
  team_id: string;
  tests: Test[];
};

const createMissingTests = async (
  { gitHubTests, team_id, tests }: CreateMissingTests,
  options: ModelOptions
): Promise<Test[]> => {
  const missingTests = gitHubTests.filter((test) => {
    return !tests.find((t) => test.path === t.path);
  });

  return Promise.all(
    missingTests.map((t) => {
      return createTest({ code: "", path: t.path, team_id }, options);
    })
  );
};

export const deleteGitHubTests = async (
  { branch, teams, tests }: DeleteGitHubTests,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("deleteGitHubTests");

  const integrationIds = uniq(teams.map((t) => t.git_sync_integration_id));
  if (integrationIds.length !== 1) {
    log.error("multiple integration ids", integrationIds);
    throw new ClientError("tests belong to multiple teams");
  }

  const { files } = await findTestsForBranch(
    { branch, integrationId: integrationIds[0] },
    options
  );

  const testsToDelete = files.filter((test) => {
    return tests.some((t) => t.path === test.path);
  });

  const message = `delete ${testsToDelete.map((t) => t.path).join(", ")}`;
  // remove the contents of each file to delete
  const tree = testsToDelete.map((test) => {
    return {
      mode: BLOB_MODE,
      path: test.path,
      sha: null,
    };
  });

  await createCommit({ branch, message, team: teams[0], tree }, options);
};

export const upsertGitHubTests = async (
  { branch, integrationId, team_id, tests }: UpsertGitHubTests,
  options: ModelOptions
): Promise<Test[]> => {
  const log = options.logger.prefix("upsertGitHubTests");

  const { files: gitHubTests } = await findTestsForBranch(
    { branch, integrationId },
    options
  );

  const branchTests = tests.filter((test) => {
    return test.guide || gitHubTests.some((t) => t.path === test.path);
  });
  const missingTests = await createMissingTests(
    { gitHubTests, team_id, tests },
    options
  );

  const combinedTests = [...branchTests, ...missingTests].sort((a, b) => {
    return a.path < b.path ? -1 : 1;
  });
  log.debug(`return ${combinedTests.length} tests`);

  return combinedTests;
};
