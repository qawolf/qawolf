import { db } from "../db";
import { ClientError } from "../errors";
import { Logger } from "../Logger";
import { findLatestRuns, findRunResult } from "../models/run";
import {
  createTestAndTestTriggers,
  deleteTests,
  findTest,
  findTestForRun,
  findTestsForTrigger,
  updateTest,
} from "../models/test";
import { deleteTestTriggersForTests } from "../models/test_trigger";
import { findDefaultTriggerForTeam } from "../models/trigger";
import {
  Context,
  CreateTestMutation,
  DeleteTestsMutation,
  Team,
  Test,
  TestQuery,
  TestResult,
  TestSummary,
  TriggerIdQuery,
  UpdateTestMutation,
} from "../types";
import {
  ensureTeams,
  ensureTestAccess,
  ensureTriggerAccess,
  ensureUser,
} from "./utils";

const ALLOW_LIST = ["flaurida", "jperl"];

type FindTeamAndTriggerIdsForCreateTest = {
  logger: Logger;
  teams: Team[];
  trigger_id: string | null;
};

export const findTeamAndTriggerIdsForCreateTest = async ({
  logger,
  teams,
  trigger_id,
}: FindTeamAndTriggerIdsForCreateTest): Promise<{
  team: Team;
  triggerIds: string[];
}> => {
  // if trigger id provided, ensure trigger access and return associated team
  if (trigger_id) {
    const team = await ensureTriggerAccess({ logger, teams, trigger_id });
    const defaultTrigger = await findDefaultTriggerForTeam(team.id, { logger });

    const triggerIds = Array.from(new Set([defaultTrigger.id, trigger_id]));

    return { triggerIds, team };
  }
  // if user on multiple teams, cannot choose which team to create test for
  if (teams.length > 1) {
    logger.error("user on multiple teams");
    throw new Error("trigger not specified");
  }

  const team = teams[0];
  const defaultTrigger = await findDefaultTriggerForTeam(team.id, { logger });

  return { triggerIds: [defaultTrigger.id], team };
};

/**
 * @returns The new test object
 */
export const createTestResolver = async (
  _: Record<string, unknown>,
  { trigger_id, url }: CreateTestMutation,
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

  const { team, triggerIds } = await findTeamAndTriggerIdsForCreateTest({
    logger,
    teams,
    trigger_id,
  });

  return db.transaction(async (trx) => {
    const { test } = await createTestAndTestTriggers(
      {
        code,
        creator_id: user.id,
        team_id: team.id,
        trigger_ids: triggerIds,
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
    await deleteTestTriggersForTests(ids, { logger, trx });
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
  { id, trigger_id }: Test & { trigger_id: string },
  _: Record<string, unknown>,
  { logger }: Context
): Promise<TestSummary> => {
  const runs = await findLatestRuns({ test_id: id, trigger_id }, { logger });

  const lastRun = runs[0] || null;
  const gif_url = lastRun?.gif_url;

  return { gif_url, last_runs: runs };
};

/**
 * @returns All tests for a single trigger, ordered alphabetically by test name ascending.
 */
export const testsResolver = async (
  { trigger_id }: TriggerIdQuery,
  _: Record<string, unknown>,
  { logger, teams }: Context
): Promise<Test[]> => {
  await ensureTriggerAccess({ logger, trigger_id, teams });
  const tests = await findTestsForTrigger(trigger_id, { logger });

  // include trigger ID so we can load appropriate runs in nested query
  return tests.map((test) => {
    return { ...test, trigger_id };
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
