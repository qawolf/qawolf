import { db } from "../db";
import {
  createTestTriggersForTrigger,
  deleteTestTriggersForTrigger,
  findTestTriggersForTests,
} from "../models/test_trigger";
import {
  Context,
  TestIdsQuery,
  TestTriggers,
  UpdateTestTriggersMutation,
} from "../types";
import { ensureTestAccess, ensureTriggerAccess } from "./utils";

/**
 * @returns array of test ids and associated trigger ids
 */
export const testTriggersResolver = async (
  _: Record<string, unknown>,
  { test_ids }: TestIdsQuery,
  { logger, teams }: Context
): Promise<TestTriggers[]> => {
  const log = logger.prefix("testTriggersResolver");
  log.debug("tests", test_ids);

  await Promise.all(
    test_ids.map((test_id) => {
      return ensureTestAccess({ logger, teams, test_id });
    })
  );

  return findTestTriggersForTests(test_ids, { logger });
};

/**
 * @returns Count of test triggers deleted
 */
export const updateTestTriggersResolver = async (
  _: Record<string, unknown>,
  { add_trigger_id, remove_trigger_id, test_ids }: UpdateTestTriggersMutation,
  { logger, teams }: Context
): Promise<TestTriggers[]> => {
  const log = logger.prefix("updateTestTriggersResolver");
  log.debug("tests", test_ids);

  if (!add_trigger_id && !remove_trigger_id) {
    log.error("add and remove trigger ids not provided");
    throw new Error("Must provide add or remove trigger id");
  }

  await Promise.all(
    test_ids.map((test_id) => ensureTestAccess({ logger, teams, test_id }))
  );

  await ensureTriggerAccess({
    logger,
    teams,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    trigger_id: (add_trigger_id || remove_trigger_id)!,
  });

  return db.transaction(async (trx) => {
    if (add_trigger_id) {
      await createTestTriggersForTrigger(
        { test_ids, trigger_id: add_trigger_id },
        { logger, trx }
      );
    } else {
      await deleteTestTriggersForTrigger(
        {
          test_ids,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          trigger_id: remove_trigger_id!,
        },
        { logger, trx }
      );
    }

    return findTestTriggersForTests(test_ids, { logger, trx });
  });
};
