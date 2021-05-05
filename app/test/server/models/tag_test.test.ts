import {
  createTagTestsForTag,
  deleteTagTestsForTag,
  findTagsForTests,
} from "../../../server/models/tag_test";
import { prepareTestDb } from "../db";
import {
  buildTag,
  buildTagTest,
  buildTeam,
  buildTest,
  buildUser,
  logger,
} from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));

  await db("tags").insert([buildTag({}), buildTag({ i: 2 })]);
  await db("tests").insert([
    buildTest({}),
    buildTest({ i: 2 }),
    buildTest({ i: 3 }),
    buildTest({ i: 4 }),
  ]);
});

describe("createTagTestsForTag", () => {
  afterEach(() => db("tag_tests").del());

  it("creates tag tests for a tag", async () => {
    const tagTests = await createTagTestsForTag(
      { tag_id: "tag2Id", test_ids: ["test2Id", "test3Id"] },
      options
    );

    expect(tagTests).toMatchObject([
      { tag_id: "tag2Id", test_id: "test2Id" },
      { tag_id: "tag2Id", test_id: "test3Id" },
    ]);

    const dbTagTests = await db("tag_tests");

    expect(dbTagTests).toHaveLength(2);
  });

  it("handles pre-existing tag tests", async () => {
    await db("tag_tests").insert(
      buildTagTest({ tag_id: "tag2Id", test_id: "test2Id" })
    );

    const tagTests = await createTagTestsForTag(
      { tag_id: "tag2Id", test_ids: ["test2Id", "test3Id"] },
      options
    );

    expect(tagTests).toHaveLength(1);

    const dbTagTests = await db("tag_tests");

    expect(dbTagTests).toMatchObject([
      { tag_id: "tag2Id", test_id: "test2Id" },
      { tag_id: "tag2Id", test_id: "test3Id" },
    ]);
  });
});

describe("deleteTagTestsForTag", () => {
  afterEach(() => db("tag_tests").del());

  it("deletes tag tests for a tag", async () => {
    await db("tag_tests").insert([
      buildTagTest({ tag_id: "tag2Id", test_id: "test2Id" }),
      buildTagTest({ i: 2, tag_id: "tag2Id", test_id: "test3Id" }),
      buildTagTest({ i: 3, tag_id: "tag2Id", test_id: "test4Id" }),
      buildTagTest({ i: 4, tag_id: "tagId", test_id: "test3Id" }),
    ]);

    const tagTests = await deleteTagTestsForTag(
      {
        tag_id: "tag2Id",
        test_ids: ["test2Id", "test3Id"],
      },
      options
    );

    expect(tagTests).toMatchObject([{ id: "tagTestId" }, { id: "tagTest2Id" }]);

    const dbTagTests = await db("tag_tests");

    expect(dbTagTests).toHaveLength(2);
  });
});

describe("findTagsForTests", () => {
  it("finds tags for tests", async () => {
    afterEach(() => db("tag_tests").del());

    await db("tag_tests").insert([
      buildTagTest({ tag_id: "tag2Id", test_id: "test2Id" }),
      buildTagTest({ i: 2, tag_id: "tag2Id", test_id: "test3Id" }),
      buildTagTest({ i: 3, tag_id: "tag2Id", test_id: "test4Id" }),
      buildTagTest({ i: 4, tag_id: "tagId", test_id: "test3Id" }),
    ]);

    const tagsForTests = await findTagsForTests(
      ["testId", "test2Id", "test3Id"],
      options
    );

    expect(tagsForTests).toMatchObject([
      { tags: [], test_id: "testId" },
      { tags: [{ id: "tag2Id" }], test_id: "test2Id" },
      { tags: [{ id: "tagId" }, { id: "tag2Id" }], test_id: "test3Id" },
    ]);
  });
});
