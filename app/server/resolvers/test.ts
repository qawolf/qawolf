import { buildTestCode } from "../../shared/utils";
import { deleteGitHubTests, upsertGitHubTests } from "../models/github_tests";
import { findLatestRuns } from "../models/run";
import {
  createTest,
  deleteTests,
  findTests,
  findTestsForTeam,
  updateTest,
  updateTestsGroup,
} from "../models/test";
import { deleteTestTriggersForTests } from "../models/test_trigger";
import { createFileForTest } from "../services/gitHub/file";
import { trackSegmentEvent } from "../services/segment";
import {
  Context,
  CreateTestMutation,
  DeleteTestsMutation,
  Test,
  TestsQuery,
  TestSummariesQuery,
  TestSummary,
  UpdateTestMutation,
  UpdateTestsGroupMutation,
} from "../types";
import { slug } from "../utils";
import {
  ensureGroupAccess,
  ensureTeamAccess,
  ensureTestAccess,
  ensureUser,
} from "./utils";

/**
 * @returns The new test object
 */
export const createTestResolver = async (
  _: Record<string, unknown>,
  { branch, group_id, guide, team_id, url }: CreateTestMutation,
  { db, logger, user: contextUser, teams }: Context
): Promise<Test> => {
  const log = logger.prefix("createTestResolver");

  const user = ensureUser({ logger, user: contextUser });
  const team = ensureTeamAccess({ logger, team_id, teams });
  if (group_id) await ensureGroupAccess({ group_id, teams }, { db, logger });

  log.debug(user.id);

  trackSegmentEvent({
    active: true,
    event: guide ? "Guide Created" : "Test Created",
    user,
  });

  return db.transaction(async (trx) => {
    const syncToGit = !!(branch && team.git_sync_integration_id && !guide);

    const test = await createTest(
      {
        code: buildTestCode(url),
        creator_id: user.id,
        group_id,
        guide,
        path: syncToGit ? `qawolf/${slug()}.test.js` : null,
        team_id: team_id,
      },
      { db: trx, logger }
    );

    if (syncToGit) {
      log.debug("git branch", branch);

      await createFileForTest(
        { branch, integrationId: team.git_sync_integration_id, test },
        { db: trx, logger }
      );
    }

    return { ...test, url };
  });
};

/**
 * @returns Array of soft deleted tests
 */
export const deleteTestsResolver = async (
  _: Record<string, unknown>,
  { branch, ids }: DeleteTestsMutation,
  { db, logger, teams }: Context
): Promise<Test[]> => {
  const log = logger.prefix("deleteTestsResolver");
  log.debug("ids", ids);

  const tests = await findTests(ids, { db, logger });
  const testTeams = await Promise.all(
    tests.map((test) => ensureTestAccess({ teams, test }, { db, logger }))
  );

  if (branch && tests.some((t) => !t.guide)) {
    log.debug("delete from git branch", branch);

    await deleteGitHubTests(
      { branch, tests, teams: testTeams },
      { db, logger }
    );

    return tests;
  }

  log.debug("soft delete from database");

  return db.transaction(async (trx) => {
    await deleteTestTriggersForTests(ids, { db: trx, logger });
    return deleteTests(ids, { db: trx, logger });
  });
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
