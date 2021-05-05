import { findTagsForTests } from "../models/tag";
import { createTagTestsForTag, deleteTagTestsForTag } from "../models/tag_test";
import { Context, TagsForTest, UpdateTagTestsMutation } from "../types";
import { ensureTagAccess, ensureTestAccess } from "./utils";

export const updateTagTestsResolver = async (
  _: Record<string, unknown>,
  { add_tag_id, remove_tag_id, test_ids }: UpdateTagTestsMutation,
  { db, logger, teams }: Context
): Promise<TagsForTest[]> => {
  const log = logger.prefix("updateTagTestsResolver");
  log.debug("tests", test_ids);

  if (!add_tag_id && !remove_tag_id) {
    log.error("add or remove tag id not provided");
    throw new Error("Must provide add or remove tag id");
  }

  const testTeams = await Promise.all(
    test_ids.map((test_id) =>
      ensureTestAccess({ teams, test_id }, { db, logger })
    )
  );
  const tagTeam = await ensureTagAccess(
    { tag_id: add_tag_id || remove_tag_id, teams },
    { db, logger }
  );

  // check the test team matches the trigger's team
  testTeams.forEach((testTeam) => {
    if (testTeam.id !== tagTeam.id) {
      throw new Error("invalid team");
    }
  });

  if (add_tag_id) {
    await createTagTestsForTag(
      { tag_id: add_tag_id, test_ids },
      { db, logger }
    );
  } else {
    await deleteTagTestsForTag(
      { tag_id: remove_tag_id, test_ids },
      { db, logger }
    );
  }

  return findTagsForTests(test_ids, { db, logger });
};
