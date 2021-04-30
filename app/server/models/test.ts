import isNil from "lodash/isNil";

import { minutesFromNow } from "../../shared/utils";
import { ClientError } from "../errors";
import { ModelOptions, Test } from "../types";
import { cuid } from "../utils";

type BuildTestName = {
  guide?: string | null;
  team_id: string;
};

type CreateTest = {
  code: string;
  creator_id?: string;
  group_id?: string | null;
  guide?: string | null;
  path?: string | null;
  team_id: string;
};

type FindEnabledTestsForTrigger = {
  test_ids?: string[] | null;
  trigger_id: string;
};

export type LocationCount = {
  count: number;
  location: string | null;
};

type UpdateTest = {
  code?: string;
  id: string;
  is_enabled?: boolean;
  name?: string | null;
  path?: string | null;
  runner_requested_at?: null;
};

type UpdateTestToPending = {
  id: string;
  runner_locations: string[];
  runner_requested_branch?: string;
};

type UpdateTestsGroup = {
  group_id: string | null;
  test_ids: string[];
};

const formatTestName = (name: string, testNumber: number): string => {
  return `${name}${testNumber === 1 ? "" : ` ${testNumber}`}`;
};

export const buildTestName = async (
  { guide, team_id }: BuildTestName,
  { db, logger }: ModelOptions
): Promise<string> => {
  const proposedName = guide ? `Guide: ${guide}` : "My Test";
  const tests = await findTestsForTeam(team_id, { db, logger });

  const testNames = new Set(tests.map((test) => test.name));
  let testNumber = 1;

  while (testNames.has(formatTestName(proposedName, testNumber))) {
    testNumber++;
  }

  return formatTestName(proposedName, testNumber);
};

export const countIncompleteTests = async (
  defaultLocation: string,
  { db, logger }: ModelOptions
): Promise<LocationCount[]> => {
  const log = logger.prefix("countIncompleteTests");

  const countQuery = `SELECT COUNT(s.*), s.location
  FROM (
    SELECT coalesce(runner_locations::json->> 0, ?) as location
    FROM tests
    WHERE runner_requested_at IS NOT NULL
    UNION ALL
    SELECT location FROM runners
    WHERE test_id IS NOT NULL
  ) as s
  GROUP BY s.location`;

  const { rows } = await db.raw(countQuery, [defaultLocation]);

  const result = rows.map((row) => ({
    count: Number(row.count),
    location: row.location,
  }));

  log.debug(result);

  return result;
};

export const countTestsForTeam = async (
  team_id: string,
  { db }: ModelOptions
): Promise<{ test_enabled_count: number; test_with_trigger_count: number }> => {
  const [enabledResult, triggeredResult] = await Promise.all([
    db.raw(
      `SELECT COUNT(*) as count FROM tests WHERE team_id = ? AND deleted_at IS NULL AND is_enabled = TRUE AND guide IS NULL`,
      [team_id]
    ),
    db.raw(
      `SELECT COUNT(DISTINCT test_id) as count 
      FROM test_triggers JOIN tests ON test_triggers.test_id = tests.id 
      WHERE tests.team_id = ? AND tests.deleted_at IS NULL AND tests.is_enabled = TRUE AND guide IS NULL`,
      [team_id]
    ),
  ]);

  return {
    test_enabled_count: Number(enabledResult.rows[0].count),
    test_with_trigger_count: Number(triggeredResult.rows[0].count),
  };
};

export const createTest = async (
  { code, creator_id, group_id, guide, path, team_id }: CreateTest,
  { db, logger }: ModelOptions
): Promise<Test> => {
  const log = logger.prefix("createTest");
  log.debug("team", team_id);

  const timestamp = minutesFromNow();
  const name = path
    ? null
    : await buildTestName({ guide, team_id }, { db, logger });

  const test = {
    created_at: timestamp,
    creator_id: creator_id || null,
    code,
    deleted_at: null,
    group_id: group_id || null,
    guide: guide || null,
    id: cuid(),
    is_enabled: true,
    name,
    path: path || null,
    team_id,
    updated_at: timestamp,
  };
  await db("tests").insert(test);

  log.debug("created test", test.id);

  return test;
};

export const deleteTests = async (
  ids: string[],
  { db, logger }: ModelOptions
): Promise<Test[]> => {
  const log = logger.prefix("deleteTests");

  log.debug(ids);

  const tests = await db.transaction(async (trx) => {
    const tests = await trx.select("*").from("tests").whereIn("id", ids);
    const updates = { deleted_at: minutesFromNow(), runner_requested_at: null };
    await trx("tests").update(updates).whereIn("id", ids);
    return tests.map((test: Test) => ({ ...test, ...updates }));
  });

  log.debug("deleted", ids);

  return tests;
};

export const findEnabledTests = async (
  test_ids: string[],
  { db, logger }: ModelOptions
): Promise<Test[]> => {
  const log = logger.prefix("findEnabledTests");
  log.debug("test ids", test_ids);

  const tests = await db("tests")
    .whereIn("id", test_ids)
    .andWhere({ deleted_at: null, is_enabled: true });

  log.debug(`found ${tests.length} enabled tests`);

  return tests;
};

export const findEnabledTestsForTrigger = async (
  { test_ids, trigger_id }: FindEnabledTestsForTrigger,
  { db, logger }: ModelOptions
): Promise<Test[]> => {
  const log = logger.prefix("findEnabledTestsForTrigger");
  log.debug(trigger_id);

  const query = db
    .select("tests.*" as "*")
    .from("tests")
    .innerJoin("test_triggers", "test_triggers.test_id", "tests.id")
    .where({ deleted_at: null, trigger_id, is_enabled: true });

  if (test_ids && test_ids.length) {
    query.whereIn("tests.id", test_ids);
  }

  const tests = await query.orderBy("created_at", "asc");

  log.debug(`found ${tests.length} enabled tests for trigger ${trigger_id}`);

  return tests;
};

export const findPendingTest = async (
  location: string | null,
  { db, logger }: ModelOptions
): Promise<Pick<
  Test,
  "id" | "runner_requested_at" | "runner_requested_branch"
> | null> => {
  const log = logger.prefix("findPendingTest");

  let query = db("tests")
    .select("id")
    .select("runner_requested_at")
    .select("runner_requested_branch")
    .whereNotNull("runner_requested_at")
    .where({ deleted_at: null });

  if (location) {
    query = query.where("runner_locations", "like", `%${location}%`);
  }

  const result = await query.orderBy("runner_requested_at", "asc").first();

  if (result) {
    log.debug("found", result, "for location", location);
    return result;
  }

  return null;
};

export const findTest = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Test> => {
  const log = logger.prefix("findTest");

  if (!id) throw new Error("Id required");

  const test = await db.select("*").from("tests").where({ id }).first();

  if (!test) {
    log.error("not found", id);
    throw new Error(`test not found ${id}`);
  }

  if (test.runner_locations) {
    test.runner_locations = JSON.parse(test.runner_locations);
  }

  return test;
};

export const findTests = async (
  test_ids: string[],
  { db, logger }: ModelOptions
): Promise<Test[]> => {
  const log = logger.prefix("findTests");
  log.debug("tests", test_ids);

  const tests = await db("tests")
    .whereIn("id", test_ids)
    .andWhere({ deleted_at: null })
    .orderBy("name", "asc");

  log.debug(`found ${tests.length} tests`);

  return tests;
};

export const findTestsForTeam = async (
  team_id: string,
  { db, logger }: ModelOptions
): Promise<Test[]> => {
  const log = logger.prefix("findTestsForTeam");

  log.debug(team_id);

  const tests = await db
    .select("*")
    .from("tests")
    .where({ deleted_at: null, team_id })
    .orderBy("name", "asc")
    .orderBy("path", "asc");

  log.debug(`found ${tests.length} tests for team ${team_id}`);

  return tests;
};

export const hasIntroGuide = async (
  creator_id: string,
  { db, logger }: ModelOptions
): Promise<boolean> => {
  const log = logger.prefix("hasIntroGuide");
  log.debug("user", creator_id);

  const guide = await db("tests")
    .where({ creator_id, guide: "Create a Test" })
    .first();
  log.debug(guide ? `found ${guide.id}` : "not found");

  return !!guide;
};

export const hasTest = async (
  team_id: string,
  { db, logger }: ModelOptions
): Promise<boolean> => {
  const log = logger.prefix("hasTest");
  log.debug("team", team_id);

  const test = await db("tests").where({ guide: null, team_id }).first();
  log.debug(test ? `found ${test.id}` : "not found");

  return !!test;
};

export const updateTest = async (
  { code, id, is_enabled, name, path, runner_requested_at }: UpdateTest,
  { db, logger }: ModelOptions
): Promise<Test> => {
  const log = logger.prefix("updateTest");

  return db.transaction(async (trx) => {
    const existingTest = await findTest(id, { db: trx, logger });

    if (!existingTest) {
      log.debug("test not found", id);
      throw new Error(`Test not found ${id}`);
    }

    const updates: Partial<Test> = {
      code: code || existingTest.code,
      is_enabled: isNil(is_enabled) ? existingTest.is_enabled : is_enabled,
      updated_at: minutesFromNow(),
    };

    if (name !== undefined) {
      updates.name = name;
    }
    if (path !== undefined) {
      updates.path = path;
    }
    if (runner_requested_at === null) {
      updates.runner_requested_at = runner_requested_at;
      updates.runner_requested_branch = null;
    }

    try {
      await trx("tests").where({ id }).update(updates);
    } catch (error) {
      if (error.message.includes("tests_unique_name_team_id")) {
        throw new ClientError("test name must be unique");
      }

      throw error;
    }

    log.debug("updated", id, updates);

    return { ...existingTest, ...updates };
  });
};

export const updateTestToPending = async (
  options: UpdateTestToPending,
  { db, logger }: ModelOptions
): Promise<boolean> => {
  const log = logger.prefix("updateTestToPending");

  const runner_locations = options.runner_locations?.length
    ? JSON.stringify(options.runner_locations.slice(0, 2))
    : null;

  // do not update if there is a runner assigned
  // this could happen during a concurrent assignment
  const sql = `UPDATE tests
  SET runner_locations = ?, runner_requested_at = now(), runner_requested_branch = ?
  WHERE id = ? 
    AND runner_requested_at IS NULL 
    AND id NOT IN (SELECT test_id FROM runners)`;

  const result = await db.raw(sql, [
    runner_locations,
    options.runner_requested_branch || null,
    options.id,
  ]);

  const didUpdate = result.rowCount > 0;
  log.debug(options, didUpdate ? "updated" : "skipped");

  return didUpdate;
};

export const updateTestsGroup = async (
  { group_id, test_ids }: UpdateTestsGroup,
  { db, logger }: ModelOptions
): Promise<Test[]> => {
  const log = logger.prefix("updateTestsGroup");
  log.debug("group", group_id, "tests", test_ids);

  const tests = await db("tests")
    .whereIn("id", test_ids)
    .andWhere({ deleted_at: null });
  const testIds = tests.map((t) => t.id);

  const updated_at = new Date().toISOString();

  await db("tests").whereIn("id", testIds).update({ group_id, updated_at });
  log.debug("updated", testIds);

  return tests.map((t) => {
    return { ...t, group_id, updated_at };
  });
};
