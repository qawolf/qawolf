import { ClientError } from "../errors";
import { findLatestRuns, findRunResult } from "../models/run";
import {
  createTest,
  deleteTests,
  findTest,
  findTestForRun,
  findTestsForTeam,
  updateTest,
} from "../models/test";
import { deleteTestTriggersForTests } from "../models/test_trigger";
import {
  Context,
  CreateTestMutation,
  DeleteTestsMutation,
  TeamIdQuery,
  Test,
  TestQuery,
  TestResult,
  TestSummariesQuery,
  TestSummary,
  UpdateTestMutation,
} from "../types";
import { ensureTeamAccess, ensureTestAccess, ensureUser } from "./utils";

const ALLOW_LIST = ["flaurida", "jperl"];

/**
 * @returns The new test object
 */
export const createTestResolver = async (
  _: Record<string, unknown>,
  { team_id, url }: CreateTestMutation,
  { db, logger, user: contextUser, teams }: Context
): Promise<Test> => {
  const log = logger.prefix("createTestResolver");

  const user = ensureUser({ logger, user: contextUser });
  ensureTeamAccess({ logger, team_id, teams });

  log.debug(user.id);

  if (
    url.includes("qawolf.com") &&
    !ALLOW_LIST.includes(user.github_login || "")
  ) {
    log.error("recursion", user.id);
    throw new ClientError("recursion requires an enterprise plan");
  }

  const code = `const { context } = await launch();\nconst page = await context.newPage();\nawait page.goto('${url}', { waitUntil: "domcontentloaded" });\n// 🐺 QA Wolf will create code here`;

  return createTest(
    {
      code,
      creator_id: user.id,
      team_id: team_id,
    },
    { db, logger }
  );
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
  { team_id }: TeamIdQuery,
  { db, logger, teams }: Context
): Promise<Test[]> => {
  ensureTeamAccess({ logger, team_id, teams });

  return findTestsForTeam(team_id, { db, logger });
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
