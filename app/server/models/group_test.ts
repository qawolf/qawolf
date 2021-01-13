import { db } from "../db";
import { GroupTest, ModelOptions } from "../types";
import { cuid } from "../utils";

type CreateGroupTest = {
  group_id: string;
  test_id: string;
};

type CreateGroupTestsForGroup = {
  group_id: string;
  test_ids: string[];
};

type DeleteGroupTestsForGroup = {
  group_id: string;
  test_ids?: string[];
};

export const createGroupTest = async (
  { group_id, test_id }: CreateGroupTest,
  { logger, trx }: ModelOptions
): Promise<GroupTest> => {
  const log = logger.prefix("createGroupTest");
  log.debug(`group ${group_id} and test ${group_id}`);

  const groupTest = {
    group_id,
    id: cuid(),
    test_id,
  };
  await (trx || db)("group_tests").insert(groupTest);

  log.debug(`created ${groupTest.id}`);

  return groupTest;
};

export const createGroupTestsForGroup = async (
  { group_id, test_ids }: CreateGroupTestsForGroup,
  { logger, trx }: ModelOptions
): Promise<GroupTest[]> => {
  const log = logger.prefix("createGroupTestsForGroup");
  log.debug("group", group_id, "tests", test_ids);

  const existingGroupTests = await (trx || db)
    .select("*")
    .from("group_tests")
    .where({ group_id });

  const groupTests: GroupTest[] = [];
  test_ids.forEach((test_id) => {
    // make sure that there is not an existing group test for this test
    // this is because it is possible to select tests that are already in the
    // group in the UI before adding
    if (existingGroupTests.find((g: GroupTest) => g.test_id === test_id)) {
      return;
    }
    groupTests.push({ group_id, id: cuid(), test_id });
  });

  await (trx || db)("group_tests").insert(groupTests);

  log.debug(`created ${groupTests.length} group tests`);
  return groupTests;
};

export const deleteGroupTestsForGroup = async (
  { group_id, test_ids }: DeleteGroupTestsForGroup,
  { logger, trx }: ModelOptions
): Promise<number> => {
  const log = logger.prefix("deleteGroupTestsForGroup");
  log.debug("group", group_id);

  const deleteCount = await (trx || db)("group_tests")
    .where((builder) => {
      if (test_ids) {
        builder.whereIn("test_id", test_ids);
      }
      builder.where({ group_id });
    })
    .del();

  log.debug(`deleted ${deleteCount} group_tests`);
  return deleteCount;
};

export const deleteGroupTestsForTests = async (
  testIds: string[],
  { logger, trx }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("deleteGroupTestsForTests");
  log.debug(testIds);

  const deleteCount = await (trx || db)("group_tests")
    .whereIn("test_id", testIds)
    .del();

  log.debug(`deleted ${deleteCount} group_tests`);
};
