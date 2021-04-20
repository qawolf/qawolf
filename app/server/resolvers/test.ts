import { camelCase } from "lodash";

import { buildTestCode } from "../../shared/utils";
import { findLatestRuns, findRunResult } from "../models/run";
import {
  createTest,
  deleteTests,
  findTest,
  findTestForRun,
  findTestsForTeam,
  updateTest,
  updateTestsGroup,
} from "../models/test";
import { deleteTestTriggersForTests } from "../models/test_trigger";
import { findTestsForBranch } from "../services/gitHub/tree";
import { trackSegmentEvent } from "../services/segment";
import {
  Context,
  CreateTestMutation,
  DeleteTestsMutation,
  GitTree,
  ModelOptions,
  Test,
  TestQuery,
  TestResult,
  TestsQuery,
  TestSummariesQuery,
  TestSummary,
  UpdateTestMutation,
  UpdateTestsGroupMutation,
} from "../types";
import { GIT_TEST_FILE_EXTENSION } from "../utils";
import {
  ensureGroupAccess,
  ensureTeamAccess,
  ensureTestAccess,
  ensureUser,
} from "./utils";

type CreateMissingTests = {
  gitHubTests: GitTree["tree"];
  team_id: string;
  tests: Test[];
};

type UpsertGitHubTests = {
  branch: string;
  integrationId: string;
  team_id: string;
  tests: Test[];
};

const buildTestName = (path: string): string => {
  return path.split(GIT_TEST_FILE_EXTENSION)[0];
};

const createMissingTests = async (
  { gitHubTests, team_id, tests }: CreateMissingTests,
  options: ModelOptions
): Promise<Test[]> => {
  const missingTests = gitHubTests.filter((test) => {
    return !tests.some((t) => {
      return buildTestName(test.path) === camelCase(t.name);
    });
  });

  return Promise.all(
    missingTests.map((t) => {
      const formattedName = buildTestName(t.path);
      return createTest({ code: "", name: formattedName, team_id }, options);
    })
  );
};

export const upsertGitHubTests = async (
  { branch, integrationId, team_id, tests }: UpsertGitHubTests,
  options: ModelOptions
): Promise<Test[]> => {
  const log = options.logger.prefix("upsertGitHubTests");

  const gitHubTests = await findTestsForBranch(
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

  const finalTests = [...branchTests, ...missingTests].sort((a, b) => {
    return a.name < b.name ? -1 : 1;
  });
  log.debug(`return ${finalTests.length} tests`);

  return finalTests;
};

/**
 * @returns The new test object
 */
export const createTestResolver = async (
  _: Record<string, unknown>,
  { group_id, guide, team_id, url }: CreateTestMutation,
  { db, logger, user: contextUser, teams }: Context
): Promise<Test> => {
  const log = logger.prefix("createTestResolver");

  const user = ensureUser({ logger, user: contextUser });
  ensureTeamAccess({ logger, team_id, teams });
  if (group_id) await ensureGroupAccess({ group_id, teams }, { db, logger });

  log.debug(user.id);

  trackSegmentEvent({
    active: true,
    event: guide ? "Guide Created" : "Test Created",
    user,
  });

  const test = await createTest(
    {
      code: buildTestCode(url),
      creator_id: user.id,
      group_id,
      guide,
      team_id: team_id,
    },
    { db, logger }
  );

  return { ...test, url };
};

/**
 * @returns Array of soft deleted tests
 */
export const deleteTestsResolver = async (
  _: Record<string, unknown>,
  { ids }: DeleteTestsMutation,
  { db, logger, teams }: Context
): Promise<Test[]> => {
  await Promise.all(
    ids.map((id) => ensureTestAccess({ teams, test_id: id }, { db, logger }))
  );

  return db.transaction(async (trx) => {
    await deleteTestTriggersForTests(ids, { db: trx, logger });

    return deleteTests(ids, { db: trx, logger });
  });
};

export const testResolver = async (
  _: Record<string, unknown>,
  { id, run_id }: TestQuery,
  { db, logger, teams }: Context
): Promise<TestResult> => {
  const log = logger.prefix("testResolver");

  log.debug({ id, run_id });

  if (!id && !run_id) {
    throw new Error("Must provide id or run_id");
  }

  const test = id
    ? await findTest(id, { db, logger })
    : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await findTestForRun(run_id!, { db, logger });

  await ensureTestAccess({ teams, test }, { db, logger });

  const runResult = run_id ? await findRunResult(run_id, { db, logger }) : null;
  if (runResult) {
    await ensureTestAccess(
      { teams, test_id: runResult.test_id },
      { db, logger }
    );
  }

  return { run: runResult, test };
};

export const testSummariesResolver = async (
  _: Record<string, unknown>,
  { test_ids, trigger_id }: TestSummariesQuery,
  { db, logger, teams }: Context
): Promise<TestSummary[]> => {
  const log = logger.prefix("testSummariesResolver");
  log.debug("tests", test_ids);

  await Promise.all(
    test_ids.map((test_id) =>
      ensureTestAccess({ teams, test_id }, { db, logger })
    )
  );

  return Promise.all(
    test_ids.map(async (test_id) => {
      const runs = await findLatestRuns(
        { test_id, trigger_id },
        { db, logger }
      );

      const lastRun = runs[0] || null;
      const gif_url = lastRun?.gif_url;

      return { gif_url, last_runs: runs, test_id };
    })
  );
};

/**
 * @returns All tests for a team, ordered alphabetically by test name ascending.
 */
export const testsResolver = async (
  _: Record<string, unknown>,
  { branch, team_id }: TestsQuery,
  { db, logger, teams }: Context
): Promise<Test[]> => {
  const log = logger.prefix("testsResolver");
  log.debug("team", team_id, "branch", branch);

  const team = ensureTeamAccess({ logger, team_id, teams });
  const tests = await findTestsForTeam(team_id, { db, logger });

  if (!branch || !team.git_sync_integration_id) {
    log.debug("no branch or git sync integation id");
    return tests;
  }

  return upsertGitHubTests(
    {
      branch,
      integrationId: team.git_sync_integration_id,
      team_id: team.id,
      tests,
    },
    { db, logger }
  );
};

export const updateTestResolver = async (
  _: Record<string, unknown>,
  args: UpdateTestMutation,
  { db, logger, teams }: Context
): Promise<Test> => {
  await ensureTestAccess({ teams, test_id: args.id }, { db, logger });
  const test = await updateTest(args, { db, logger });
  return test;
};

export const updateTestsGroupResolver = async (
  _: Record<string, unknown>,
  { group_id, test_ids }: UpdateTestsGroupMutation,
  { db, logger, teams }: Context
): Promise<Test[]> => {
  const log = logger.prefix("updateTestsGroupResolver");
  log.debug("group", group_id, "tests", test_ids);

  await Promise.all(
    test_ids.map((test_id) => {
      return ensureTestAccess({ teams, test_id }, { db, logger });
    })
  );

  return updateTestsGroup({ group_id, test_ids }, { db, logger });
};
