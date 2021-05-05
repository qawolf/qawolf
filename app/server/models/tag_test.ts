import { ModelOptions, TagsForTest,TagTest } from "../types";
import { cuid } from "../utils";

type UpdateTagTestsForTag = {
  tag_id: string;
  test_ids: string[];
};

export const createTagTestsForTag = async (
  { tag_id, test_ids }: UpdateTagTestsForTag,
  { db, logger }: ModelOptions
): Promise<TagTest[]> => {
  const log = logger.prefix("createTagTestsForTag");
  log.debug("tag", tag_id, "tests", test_ids);

  const existingTagTests = await db("tag_tests").where({ tag_id });

  const tagTests: TagTest[] = [];

  test_ids.forEach((test_id) => {
    // make sure that there is not an existing tag test for this test
    // this is because it is possible to select tests that are already in the
    // tag in the UI before adding
    if (existingTagTests.find((t: TagTest) => t.test_id === test_id)) return;

    tagTests.push({ id: cuid(), tag_id, test_id });
  });

  await db("tag_tests").insert(tagTests);
  log.debug(`created ${tagTests.length} tag tests`);

  return tagTests;
};

export const deleteTagTestsForTag = async (
  { tag_id, test_ids }: UpdateTagTestsForTag,
  { db, logger }: ModelOptions
): Promise<TagTest[]> => {
  const log = logger.prefix("deleteTagTestsForTag");
  log.debug("tag", tag_id, "tests", test_ids);

  const tagTests = await db("tag_tests")
    .whereIn("test_id", test_ids)
    .andWhere({ tag_id })
    .del("*");

  log.debug(`deleted ${tagTests.length} tag tests`);

  return tagTests;
};

export const findTagsForTests = async (
  test_ids: string[],
  { db, logger }: ModelOptions
): Promise<TagsForTest[]> => {
  const log = logger.prefix("findTagsForTests");
  log.debug("tests", test_ids);

  const tests = await db("tests").whereIn("id", test_ids);

  const tags = await db("tags")
    .select("tags.*")
    .select("tag_tests.test_id")
    .innerJoin("tag_tests", "tags.id", "tag_tests.tag_id")
    .whereIn("tag_tests.test_id", test_ids)
    .orderBy("tags.name", "asc");

  const result: TagsForTest[] = tests.map(({ id }) => {
    return { tags: [], test_id: id };
  });

  tags.forEach((t) => {
    result.find((r) => r.test_id === t.test_id)?.tags.push(t);
  });

  return result;
};
