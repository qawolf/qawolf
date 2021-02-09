import { db } from "../db";
import {
  createTestTriggersForTrigger,
  deleteTestTriggersForTrigger,
} from "../models/test_trigger";
import { Context, UpdateTestTriggersMutation } from "../types";
import { ensureTestAccess, ensureTriggerAccess } from "./utils";

/**
 * @returns Count of test triggers deleted
 */
export const updateTestTriggersResolver = async (
  _: Record<string, unknown>,
  { add_trigger_id, remove_trigger_id, test_ids }: UpdateTestTriggersMutation,
  { logger, teams }: Context
): Promise<number> => {
  const log = logger.prefix("updateTestTriggersResolver");
  log.debug("tests", test_ids);

  if (!add_trigger_id && !remove_trigger_id) {
    log.error("add and remove trigger ids not provided");
    throw new Error("Must provide add or remove trigger id");
  }

  await ensureTriggerAccess({
    logger,
    teams,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    trigger_id: (add_trigger_id || remove_trigger_id)!,
  });

  if (add_trigger_id) {
    await Promise.all(
      test_ids.map((test_id) => ensureTestAccess({ logger, teams, test_id }))
    );
    // use a transaction since we check for existing test triggers before inserting
    const testTriggers = await db.transaction(async (trx) => {
      return createTestTriggersForTrigger(
        { test_ids, trigger_id: add_trigger_id },
        { logger, trx }
      );
    });
    return testTriggers.length;
  }

  return deleteTestTriggersForTrigger(
    {
      test_ids,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      trigger_id: remove_trigger_id!,
    },
    { logger }
  );
};
