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
  { db, logger, teams }: Context
): Promise<TestTriggers[]> => {
  const log = logger.prefix("testTriggersResolver");
  log.debug("tests", test_ids);

  await Promise.all(
    test_ids.map((test_id) =>
      ensureTestAccess({ teams, test_id }, { db, logger })
    )
  );

  return findTestTriggersForTests(test_ids, { db, logger });
};

/**
 * @returns Count of test triggers deleted
 */
export const updateTestTriggersResolver = async (
  _: Record<string, unknown>,
  { add_trigger_id, remove_trigger_id, test_ids }: UpdateTestTriggersMutation,
  { db, logger, teams }: Context
): Promise<TestTriggers[]> => {
  const log = logger.prefix("updateTestTriggersResolver");
  log.debug("tests", test_ids);

  if (!add_trigger_id && !remove_trigger_id) {
    log.error("add and remove trigger ids not provided");
    throw new Error("Must provide add or remove trigger id");
  }

  const testTeams = await Promise.all(
    test_ids.map((test_id) =>
      ensureTestAccess({ teams, test_id }, { db, logger })
    )
  );

  const triggerTeam = await ensureTriggerAccess(
    {
      teams,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      trigger_id: (add_trigger_id || remove_trigger_id)!,
    },
    { db, logger }
  );

  // check the test team matches the trigger's team
  testTeams.forEach((testTeam) => {
    if (testTeam.id !== triggerTeam.id) {
      throw new Error("Invalid team");
    }
  });

  if (add_trigger_id) {
    await createTestTriggersForTrigger(
      { test_ids, trigger_id: add_trigger_id },
      { db, logger }
    );
  } else {
    await deleteTestTriggersForTrigger(
      {
        test_ids,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        trigger_id: remove_trigger_id!,
      },
      { db, logger }
    );
  }

  return findTestTriggersForTests(test_ids, { db, logger });
};
