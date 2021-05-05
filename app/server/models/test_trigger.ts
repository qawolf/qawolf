import { ModelOptions, TestTrigger, TestTriggers } from "../types";
import { cuid } from "../utils";

type CreateTestTriggersForTrigger = {
  test_ids: string[];
  trigger_id: string;
};

type DeleteTestTriggersForTrigger = {
  test_ids?: string[];
  trigger_id: string;
};

export const createTestTriggersForTrigger = async (
  { test_ids, trigger_id }: CreateTestTriggersForTrigger,
  { db, logger }: ModelOptions
): Promise<TestTrigger[]> => {
  const log = logger.prefix("createTestTriggersForTrigger");
  log.debug("trigger", trigger_id, "tests", test_ids);

  const existingTestTriggers = await db
    .select("*")
    .from("test_triggers")
    .where({ trigger_id });

  const testTriggers: TestTrigger[] = [];
  test_ids.forEach((test_id) => {
    // make sure that there is not an existing test trigger for this test
    // this is because it is possible to select tests that are already in the
    // trigger in the UI before adding
    if (existingTestTriggers.find((g: TestTrigger) => g.test_id === test_id)) {
      return;
    }
    testTriggers.push({ id: cuid(), test_id, trigger_id });
  });

  await db("test_triggers").insert(testTriggers);

  log.debug(`created ${testTriggers.length} test triggers`);
  return testTriggers;
};

export const deleteTestTriggersForTrigger = async (
  { test_ids, trigger_id }: DeleteTestTriggersForTrigger,
  { db, logger }: ModelOptions
): Promise<number> => {
  const log = logger.prefix("deleteTestTriggersForTrigger");
  log.debug("trigger", trigger_id);

  const deleteCount = await db("test_triggers")
    .where((builder) => {
      if (test_ids) {
        builder.whereIn("test_id", test_ids);
      }
      builder.where({ trigger_id });
    })
    .del();

  log.debug(`deleted ${deleteCount} test_triggers`);
  return deleteCount;
};

export const deleteTestTriggersForTests = async (
  testIds: string[],
  { db, logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("deleteTestTriggersForTests");
  log.debug(testIds);

  const deleteCount = await db("test_triggers")
    .whereIn("test_id", testIds)
    .del();

  log.debug(`deleted ${deleteCount} test_triggers`);
};

export const findTestTriggersForTests = async (
  testIds: string[],
  { db, logger }: ModelOptions
): Promise<TestTriggers[]> => {
  const log = logger.prefix("findTestTriggersForTests");
  log.debug(testIds);

  const tests = await db("tests").select("id").whereIn("id", testIds);

  const testTriggers = await db("test_triggers")
    .select("test_triggers.*")
    .innerJoin("triggers", "test_triggers.trigger_id", "triggers.id")
    .whereIn("test_triggers.test_id", testIds)
    .andWhere({ "triggers.deleted_at": null });

  const result: TestTriggers[] = tests.map((test) => {
    return { test_id: test.id, trigger_ids: [] };
  });

  testTriggers.forEach((t) => {
    const existingRow = result.find((r) => r.test_id === t.test_id);
    if (existingRow) existingRow.trigger_ids.push(t.trigger_id);
  });

  return result;
};

export const hasTestTrigger = async (
  team_id: string,
  { db, logger }: ModelOptions
): Promise<boolean> => {
  const log = logger.prefix("hasTestTrigger");
  log.debug("team", team_id);

  const testTrigger = await db("test_triggers")
    .innerJoin("triggers", "test_triggers.trigger_id", "triggers.id")
    .where({ team_id })
    .first();
  log.debug(testTrigger ? `found ${testTrigger.id}` : "not found");

  return !!testTrigger;
};
