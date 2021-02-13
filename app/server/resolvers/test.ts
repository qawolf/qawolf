import { ClientError } from "../errors";
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
  ModelOptions,
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
  teams: Team[];
  trigger_id: string | null;
};

export const findTeamAndTriggerIdsForCreateTest = async (
  { teams, trigger_id }: FindTeamAndTriggerIdsForCreateTest,
  { db, logger }: ModelOptions
): Promise<{
  team: Team;
  triggerIds: string[];
}> => {
  // if trigger id provided, ensure trigger access and return associated team
  if (trigger_id) {
    const team = await ensureTriggerAccess(
      { teams, trigger_id },
      { db, logger }
    );
    const defaultTrigger = await findDefaultTriggerForTeam(team.id, {
      db,
      logger,
    });

    const triggerIds = Array.from(new Set([defaultTrigger.id, trigger_id]));

    return { triggerIds, team };
  }
  // if user on multiple teams, cannot choose which team to create test for
  if (teams.length > 1) {
    logger.error("user on multiple teams");
    throw new Error("trigger not specified");
  }

  const team = teams[0];
  const defaultTrigger = await findDefaultTriggerForTeam(team.id, {
    db,
    logger,
  });

  return { triggerIds: [defaultTrigger.id], team };
};

/**
 * @returns The new test object
 */
export const createTestResolver = async (
  _: Record<string, unknown>,
  { trigger_id, url }: CreateTestMutation,
  { db, logger, user: contextUser, teams: contextTeams }: Context
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

  const { team, triggerIds } = await findTeamAndTriggerIdsForCreateTest(
    {
      teams,
      trigger_id,
    },
    { db, logger }
  );

  const { test } = await createTestAndTestTriggers(
    {
      code,
      creator_id: user.id,
      team_id: team.id,
      trigger_ids: triggerIds,
    },
    { db, logger }
  );

  return { ...test };
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

export const testSummaryResolver = async (
  { id, trigger_id }: Test & { trigger_id: string },
  _: Record<string, unknown>,
  { db, logger }: Context
): Promise<TestSummary> => {
  const runs = await findLatestRuns(
    { test_id: id, trigger_id },
    { db, logger }
  );

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
  { db, logger, teams }: Context
): Promise<Test[]> => {
  await ensureTriggerAccess({ trigger_id, teams }, { db, logger });
  const tests = await findTestsForTrigger(trigger_id, { db, logger });

  // include trigger ID so we can load appropriate runs in nested query
  return tests.map((test) => {
    return { ...test, trigger_id };
  });
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
