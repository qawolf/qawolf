import { db } from "../db";
import {
  createGroupTestsForGroup,
  deleteGroupTestsForGroup,
} from "../models/group_test";
import { Context, UpdateGroupTestsMutation } from "../types";
import { ensureGroupAccess, ensureTestAccess } from "./utils";

/**
 * @returns Updated group object
 */
export const updateGroupTestsResolver = async (
  _: Record<string, unknown>,
  { add_group_id, remove_group_id, test_ids }: UpdateGroupTestsMutation,
  { logger, teams }: Context
): Promise<number> => {
  const log = logger.prefix("updateGroupTestsResolver");
  log.debug("tests", test_ids);

  if (!add_group_id && !remove_group_id) {
    log.error("add and remove group ids not provided");
    throw new Error("Must provide add or remove group id");
  }

  await ensureGroupAccess({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    group_id: (add_group_id || remove_group_id)!,
    logger,
    teams,
  });

  if (add_group_id) {
    await Promise.all(
      test_ids.map((test_id) => ensureTestAccess({ logger, teams, test_id }))
    );
    // use a transaction since we check for existing group tests before inserting
    const groupTests = await db.transaction(async (trx) => {
      return createGroupTestsForGroup(
        { group_id: add_group_id, test_ids },
        { logger, trx }
      );
    });
    return groupTests.length;
  }

  return deleteGroupTestsForGroup(
    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      group_id: remove_group_id!,
      test_ids,
    },
    { logger }
  );
};
