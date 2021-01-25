import isNil from "lodash/isNil";

import { minutesFromNow } from "../../shared/utils";
import { db } from "../db";
import { ClientError } from "../errors";
import { ModelOptions, Test } from "../types";
import { cuid } from "../utils";

type BuildTestName = {
  name?: string;
  team_id: string;
};

type CreateTest = {
  code: string;
  creator_id: string;
  group_ids: string[];
  name?: string;
  team_id: string;
  url: string;
};

type FindEnabledTestsForGroup = {
  group_id: string;
  test_ids?: string[] | null;
};

export type LocationCount = {
  count: number;
  location: string | null;
};

type UpdateTest = {
  code?: string;
  id: string;
  is_enabled?: boolean;
  name?: string;
  runner_requested_at?: null;
  version?: number;
};

type UpdateTestToPending = {
  id: string;
  runner_locations: string[];
};

export const buildTestName = async (
  { name, team_id }: BuildTestName,
  { logger, trx }: ModelOptions
): Promise<string> => {
  const tests = await findTestsForTeam(team_id, { logger, trx });

  const testNames = new Set(tests.map((test) => test.name));
  // use current name if possible
  if (name && !testNames.has(name)) return name;

  let testNumber = tests.length + 1;

  while (testNames.has(`My Test${testNumber === 1 ? "" : ` ${testNumber}`}`)) {
    testNumber++;
  }

  return `My Test${testNumber === 1 ? "" : ` ${testNumber}`}`;
};

export const countPendingTests = async (
  defaultLocation: string,
  { logger, trx }: ModelOptions
): Promise<LocationCount[]> => {
  const log = logger.prefix("countPendingTests");

  const countQuery = `SELECT COUNT(s.*), s.location
  FROM (
    SELECT coalesce(runner_locations::json->> 0, ?) as location
    FROM tests
    WHERE runner_requested_at IS NOT NULL 
      AND deleted_at IS NULL
  ) as s
  GROUP BY s.location`;

  const { rows } = await (trx || db).raw(countQuery, [defaultLocation]);

  const result = rows.map((row) => ({
    count: Number(row.count),
    location: row.location,
  }));

  log.debug(result);

  return result;
};

export const createTestAndGroupTests = async (
  { code, creator_id, group_ids, name, team_id, url }: CreateTest,
  { logger, trx }: ModelOptions
): Promise<{ groupTestIds: string[]; test: Test }> => {
  const log = logger.prefix("createTestAndGroupTest");

  log.debug("creator", creator_id);
  const timestamp = minutesFromNow();

  const { groupTestIds, test } = await (trx || db).transaction(async (trx) => {
    const finalName = await buildTestName({ name, team_id }, { logger, trx });

    const test: Test = {
      created_at: timestamp,
      creator_id,
      code,
      deleted_at: null,
      id: cuid(),
      is_enabled: true,
      name: finalName,
      team_id,
      url,
      updated_at: timestamp,
      version: 0,
    };

    await trx("tests").insert(test);

    const groupTests = group_ids.map((group_id) => {
      return { group_id, id: cuid(), test_id: test.id };
    });
    await trx("group_tests").insert(groupTests);

    return { groupTestIds: groupTests.map((g) => g.id), test };
  });

  log.debug("created test", test.id);

  return { groupTestIds, test };
};

export const findTestsForGroup = async (
  group_id: string,
  { logger, trx }: ModelOptions
): Promise<Test[]> => {
  const log = logger.prefix("findTestsForGroup");

  log.debug(group_id);

  const tests = await (trx || db)
    .select("tests.*" as "*")
    .from("tests")
    .innerJoin("group_tests", "group_tests.test_id", "tests.id")
    .where({ deleted_at: null, "group_tests.group_id": group_id })
    .orderBy("name", "asc");

  log.debug(`found ${tests.length} tests for group ${group_id}`);

  return tests;
};

export const findTestsForTeam = async (
  team_id: string,
  { logger, trx }: ModelOptions
): Promise<Test[]> => {
  const log = logger.prefix("findTestsForTeam");

  log.debug(team_id);

  const tests = await (trx || db)
    .select("*")
    .from("tests")
    .where({ deleted_at: null, team_id })
    .orderBy("name", "asc");

  log.debug(`found ${tests.length} tests for team ${team_id}`);

  return tests;
};

export const findEnabledTestsForGroup = async (
  { group_id, test_ids }: FindEnabledTestsForGroup,
  { logger, trx }: ModelOptions
): Promise<Test[]> => {
  const log = logger.prefix("findEnabledTestsForGroup");
  log.debug(group_id);

  const query = (trx || db)
    .select("tests.*" as "*")
    .from("tests")
    .innerJoin("group_tests", "group_tests.test_id", "tests.id")
    .where({ deleted_at: null, group_id, is_enabled: true });

  if (test_ids && test_ids.length) {
    query.whereIn("tests.id", test_ids);
  }

  const tests = await query.orderBy("created_at", "asc");

  log.debug(`found ${tests.length} enabled tests for group ${group_id}`);

  return tests;
};

export const findPendingTest = async (
  location: string | null,
  { logger, trx }: ModelOptions
): Promise<Pick<Test, "id" | "runner_requested_at"> | null> => {
  const log = logger.prefix("findPendingTest");

  let query = (trx || db)("tests")
    .select("id")
    .select("runner_requested_at")
    .whereNotNull("runner_requested_at")
    .where({ deleted_at: null });

  if (location) {
    query = query.where("runner_locations", "like", `%${location}%`);
  }

  const result = await query.orderBy("runner_requested_at", "asc").first();

  if (result) log.debug("found", result, "for location", location);

  return result || null;
};

export const findTest = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<Test> => {
  const log = logger.prefix("findTest");

  if (!id) throw new Error("Id required");

  const test = await (trx || db)
    .select("*")
    .from("tests")
    .where({ id })
    .first();

  if (!test) {
    log.error("not found", id);
    throw new Error(`test not found ${id}`);
  }

  if (test.runner_locations) {
    test.runner_locations = JSON.parse(test.runner_locations);
  }

  return test;
};

export const findTestForRun = async (
  run_id: string,
  { logger, trx }: ModelOptions
): Promise<Test> => {
  const log = logger.prefix("findTestForRun");

  const test = await (trx || db)
    .select("tests.*" as "*")
    .from("tests")
    .innerJoin("runs", "runs.test_id", "tests.id")
    .where({ "runs.id": run_id })
    .first();

  if (!test) {
    log.error("not found", run_id);
    throw new Error(`test for run not found ${run_id}`);
  }

  return test;
};

export const deleteTests = async (
  ids: string[],
  { logger, trx }: ModelOptions
): Promise<Test[]> => {
  const log = logger.prefix("deleteTests");

  log.debug(ids);

  const tests = await (trx || db).transaction(async (trx) => {
    const tests = await trx.select("*").from("tests").whereIn("id", ids);
    const updates = { deleted_at: minutesFromNow() };
    await trx("tests").update(updates).whereIn("id", ids);
    return tests.map((test: Test) => ({ ...test, ...updates }));
  });

  log.debug("deleted", ids);

  return tests;
};

export const updateTest = async (
  { code, id, is_enabled, name, runner_requested_at, version }: UpdateTest,
  { logger, trx }: ModelOptions
): Promise<Test> => {
  const log = logger.prefix("updateTest");

  return (trx || db).transaction(async (trx) => {
    const existingTest = await findTest(id, { logger, trx });

    if (!existingTest) {
      log.debug("test not found", id);
      throw new Error(`Test not found ${id}`);
    }

    // do not overwrite current version with older version
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    if (!isNil(version) && existingTest.version >= version!) {
      log.debug(
        `ignore: test ${id} current version ${existingTest.version} >= update version ${version}`
      );
      return existingTest;
    }

    const updates: Partial<Test> = {
      code: code || existingTest.code,
      is_enabled: isNil(is_enabled) ? existingTest.is_enabled : is_enabled,
      name: name || existingTest.name,
      updated_at: minutesFromNow(),
      version: version || existingTest.version,
    };

    if (runner_requested_at === null) {
      updates.runner_requested_at = runner_requested_at;
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
  { logger, trx }: ModelOptions
): Promise<boolean> => {
  const log = logger.prefix("updateTestToPending");

  const runner_locations = options.runner_locations?.length
    ? JSON.stringify(options.runner_locations.slice(0, 2))
    : null;

  // do not update if there is a runner assigned
  // this could happen during a concurrent assignment
  const sql = `UPDATE tests
  SET runner_locations = ?, runner_requested_at = now()
  WHERE id = ? 
    AND runner_requested_at IS NULL 
    AND id NOT IN (SELECT test_id FROM runners)`;

  const result = await (trx || db).raw(sql, [runner_locations, options.id]);

  const didUpdate = result.rowCount > 0;
  log.debug(options, didUpdate ? "updated" : "skipped");

  return didUpdate;
};
