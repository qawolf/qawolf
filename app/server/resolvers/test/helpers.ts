import { camelCase, last, uniq } from "lodash";

import { ClientError } from "../../errors";
import { createTest } from "../../models/test";
import { deleteFile } from "../../services/gitHub/file";
import { findTestsForBranch } from "../../services/gitHub/tree";
import { GitTree, ModelOptions, Team, Test } from "../../types";
import { GIT_TEST_FILE_EXTENSION } from "../../utils";

type CreateMissingTests = {
  gitHubTests: GitTree["tree"];
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

export const buildTestName = (path: string): string => {
  const file = path.split(GIT_TEST_FILE_EXTENSION)[0];
  const fileWithoutFolder = last(file.split("/"));

  return fileWithoutFolder;
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
  console.log("IDS", integrationIds);
  if (integrationIds.length !== 1) {
    log.error("multiple integration ids", integrationIds);
    throw new ClientError("tests belong to multiple teams");
  }

  const integrationId = integrationIds[0];
  const { gitHubFields, tests: gitHubTests } = await findTestsForBranch(
    { branch, integrationId },
    options
  );

  const testsToDelete = gitHubTests.filter((test) => {
    return tests.some((t) => {
      return buildTestName(test.path) === camelCase(t.name);
    });
  });

  await Promise.all(
    testsToDelete.map((test) => {
      return deleteFile(
        { ...gitHubFields, branch, path: `qawolf/${test.path}`, sha: test.sha },
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

  const { tests: gitHubTests } = await findTestsForBranch(
    { branch, integrationId },
    options
  );

  const branchTests = tests.filter((test) => {
    return (
      test.guide ||
      gitHubTests.some((t) => {
        return buildTestName(t.path) === camelCase(test.name);
      })
    );
  });
  const missingTests = await createMissingTests(
    { gitHubTests, team_id, tests },
    options
  );

  const combinedTests = [...branchTests, ...missingTests].sort((a, b) => {
    return a.name < b.name ? -1 : 1;
  });
  log.debug(`return ${combinedTests.length} tests`);

  return combinedTests;
};
