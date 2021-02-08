import { db } from "../db";
import { ClientError } from "../errors";
import { Logger } from "../Logger";
import { findLatestRuns, findRunResult } from "../models/run";
import {
  createTestAndGroupTests,
  deleteTests,
  findTest,
  findTestForRun,
  findTestsForGroup,
  updateTest,
} from "../models/test";
import { deleteGroupTestsForTests } from "../models/test_trigger";
import { findDefaultGroupForTeam } from "../models/trigger";
import {
  Context,
  CreateTestMutation,
  DeleteTestsMutation,
  GroupIdQuery,
  Team,
  Test,
  TestQuery,
  TestResult,
  TestSummary,
  UpdateTestMutation,
} from "../types";
import {
  ensureGroupAccess,
  ensureTeams,
  ensureTestAccess,
  ensureUser,
} from "./utils";

const ALLOW_LIST = ["flaurida", "jperl"];

type FindGroupAndTeamIdsForCreateTest = {
  logger: Logger;
  group_id: string | null;
  teams: Team[];
};

export const findGroupIdsAndTeamForCreateTest = async ({
  logger,
  group_id,
  teams,
}: FindGroupAndTeamIdsForCreateTest): Promise<{
  groupIds: string[];
  team: Team;
}> => {
  // if group id provided, ensure group access and return associated team
  if (group_id) {
    const team = await ensureGroupAccess({ group_id, logger, teams });
    const defaultGroup = await findDefaultGroupForTeam(team.id, { logger });

    const groupIds = Array.from(new Set([defaultGroup.id, group_id]));

    return { groupIds, team };
  }
  // if user on multiple teams, cannot choose which team to create test for
  if (teams.length > 1) {
    logger.error("user on multiple teams");
    throw new Error("group not specified");
  }

  const team = teams[0];
  const defaultGroup = await findDefaultGroupForTeam(team.id, { logger });

  return { groupIds: [defaultGroup.id], team };
};

/**
 * @returns The new test object
 */
export const createTestResolver = async (
  _: Record<string, unknown>,
  { group_id, url }: CreateTestMutation,
  { logger, user: contextUser, teams: contextTeams }: Context
): Promise<Test> => {
  const log = logger.prefix("createTestResolver");

  const user = ensureUser({ logger, user: contextUser });
  const teams = ensureTeams({ logger, teams: contextTeams });
  log.debug(user.id);

  if (
    url.includes("qawolf.com") &&
    !ALLOW_LIST.includes(user.github_login || "")
  ) {
    log.error("recursion", user.id);
    throw new ClientError("recursion requires an enterprise plan");
  }

  const code = `const { context } = await launch();\nconst page = await context.newPage();\nawait page.goto('${url}', { waitUntil: "domcontentloaded" });\n// 🐺 QA Wolf will create code here`;

  const { groupIds, team } = await findGroupIdsAndTeamForCreateTest({
    logger,
    group_id,
    teams,
  });

  return db.transaction(async (trx) => {
    const { test } = await createTestAndGroupTests(
      {
        code,
        creator_id: user.id,
        group_ids: groupIds,
        team_id: team.id,
      },
      { logger, trx }
    );

    return { ...test };
  });
};

/**
 * @returns Array of soft deleted tests
 */
export const deleteTestsResolver = async (
  _: Record<string, unknown>,
  { ids }: DeleteTestsMutation,
  { logger, teams }: Context
): Promise<Test[]> => {
  await Promise.all(
    ids.map((id) => ensureTestAccess({ logger, teams, test_id: id }))
  );

  return db.transaction(async (trx) => {
    await deleteGroupTestsForTests(ids, { logger, trx });
    return deleteTests(ids, { logger, trx });
  });
};

export const testResolver = async (
  _: Record<string, unknown>,
  { id, run_id }: TestQuery,
  { logger, teams }: Context
): Promise<TestResult> => {
  const log = logger.prefix("testResolver");

  log.debug({ id, run_id });

  if (!id && !run_id) {
    throw new Error("Must provide id or run_id");
  }

  const test = id
    ? await findTest(id, { logger })
    : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await findTestForRun(run_id!, { logger });

  await ensureTestAccess({ logger, teams, test });

  const runResult = run_id ? await findRunResult(run_id, { logger }) : null;
  if (runResult) {
    await ensureTestAccess({ logger, teams, test_id: runResult.test_id });
  }

  return { run: runResult, test };
};

export const testSummaryResolver = async (
  { group_id, id }: Test & { group_id: string },
  _: Record<string, unknown>,
  { logger }: Context
): Promise<TestSummary> => {
  const runs = await findLatestRuns({ group_id, test_id: id }, { logger });

  const lastRun = runs[0] || null;
  const gif_url = lastRun?.gif_url;

  return { gif_url, last_runs: runs };
};

/**
 * @returns All tests for a single group, ordered alphabetically by test name ascending.
 */
export const testsResolver = async (
  { group_id }: GroupIdQuery,
  _: Record<string, unknown>,
  { logger, teams }: Context
): Promise<Test[]> => {
  await ensureGroupAccess({ logger, group_id, teams });
  const tests = await findTestsForGroup(group_id, { logger });

  // include group ID so we can load appropriate runs in nested query
  return tests.map((test) => {
    return { ...test, group_id };
  });
};

export const updateTestResolver = async (
  _: Record<string, unknown>,
  args: UpdateTestMutation,
  { logger, teams }: Context
): Promise<Test> => {
  await ensureTestAccess({ logger, teams, test_id: args.id });
  const test = await updateTest(args, { logger });
  return test;
};
