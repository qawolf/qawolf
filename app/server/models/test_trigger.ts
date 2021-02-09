import { db } from "../db";
import { ModelOptions, TestTrigger } from "../types";
import { cuid } from "../utils";

type CreateTestTrigger = {
  test_id: string;
  trigger_id: string;
};

type CreateTestTriggersForTrigger = {
  test_ids: string[];
  trigger_id: string;
};

type DeleteTestTriggersForTrigger = {
  test_ids?: string[];
  trigger_id: string;
};

export const createTestTrigger = async (
  { test_id, trigger_id }: CreateTestTrigger,
  { logger, trx }: ModelOptions
): Promise<TestTrigger> => {
  const log = logger.prefix("createTestTrigger");
  log.debug(`test ${test_id} and trigger ${trigger_id}`);

  const testTrigger = {
    id: cuid(),
    test_id,
    trigger_id,
  };
  await (trx || db)("test_triggers").insert(testTrigger);

  log.debug(`created ${testTrigger.id}`);

  return testTrigger;
};

export const createTestTriggersForTrigger = async (
  { test_ids, trigger_id }: CreateTestTriggersForTrigger,
  { logger, trx }: ModelOptions
): Promise<TestTrigger[]> => {
  const log = logger.prefix("createTestTriggersForTrigger");
  log.debug("trigger", trigger_id, "tests", test_ids);

  const existingTestTriggers = await (trx || db)
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

  await (trx || db)("test_triggers").insert(testTriggers);

  log.debug(`created ${testTriggers.length} test triggers`);
  return testTriggers;
};

export const deleteTestTriggersForTrigger = async (
  { test_ids, trigger_id }: DeleteTestTriggersForTrigger,
  { logger, trx }: ModelOptions
): Promise<number> => {
  const log = logger.prefix("deleteTestTriggersForTrigger");
  log.debug("trigger", trigger_id);

  const deleteCount = await (trx || db)("test_triggers")
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
  { logger, trx }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("deleteTestTriggersForTests");
  log.debug(testIds);

  const deleteCount = await (trx || db)("test_triggers")
    .whereIn("test_id", testIds)
    .del();

  log.debug(`deleted ${deleteCount} test_triggers`);
};
