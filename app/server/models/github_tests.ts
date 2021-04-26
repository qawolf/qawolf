import { uniq } from "lodash";

import { ClientError } from "../errors";
import { createOctokitForIntegration } from "../services/gitHub/app";
import { deleteFile } from "../services/gitHub/file";
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

  const integrationId = integrationIds[0];

  const { octokit } = await createOctokitForIntegration(integrationId, options);

  const { files: gitHubTests, ...ownerRepo } = await findTestsForBranch(
    { branch, integrationId },
    options
  );

  const testsToDelete = gitHubTests.filter((test) => {
    return tests.some((t) => t.path === test.path);
  });

  await Promise.all(
    testsToDelete.map((test) => {
      return deleteFile(
        { ...ownerRepo, branch, octokit, path: test.path, sha: test.sha },
        options
      );
    })
  );
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
