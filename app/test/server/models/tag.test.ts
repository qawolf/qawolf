import {
  createTag,
  deleteTag,
  findTag,
  findTagIdsForNames,
  findTagsForTeam,
  findTagsForTests,
  findTagsForTrigger,
  updateTag,
} from "../../../server/models/tag";
import { Tag } from "../../../server/types";
import { prepareTestDb } from "../db";
import {
  buildTag,
  buildTagTest,
  buildTagTrigger,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);

  return db("tests").insert(buildTest({}));
});

describe("createTag", () => {
  afterEach(() => db("tags").del());

  it("creates a new tag", async () => {
    const tag = await createTag(
      { name: "tag name", team_id: "teamId" },
      options
    );

    const dbTag = await db("tags").first();

    expect(tag).toMatchObject({ color: "#4545E5", name: "tag name" });
    expect(dbTag).toMatchObject(tag);
  });

  it("removes whitespace from name", async () => {
    const tag = await createTag(
      { name: "  tag name  ", team_id: "teamId" },
      options
    );

    const dbTag = await db("tags").first();

    expect(tag).toMatchObject({ color: "#4545E5", name: "tag name" });
    expect(dbTag).toMatchObject(tag);
  });

  it("throws an error if tag name taken", async () => {
    await db("tags").insert(buildTag({ name: "taken" }));

    await expect(
      (async (): Promise<Tag> => {
        return createTag({ name: "taken", team_id: "teamId" }, options);
      })()
    ).rejects.toThrowError("name must be unique");
  });

  it("throws an error if comma in tag name", async () => {
    await expect(
      (async (): Promise<Tag> => {
        return createTag({ name: "this,that", team_id: "teamId" }, options);
      })()
    ).rejects.toThrowError("cannot include commas");
  });
});

describe("deleteTag", () => {
  beforeEach(() => db("tags").insert(buildTag({})));

  afterEach(() => db("tags").del());

  it("deletes a tag", async () => {
    await db("tag_tests").insert(buildTagTest({}));

    const tag = await deleteTag("tagId", { db, logger });
    expect(tag).toMatchObject({ id: "tagId" });

    const dbTag = await db("tags").where({ id: "tagId" }).first();
    expect(dbTag).toBeFalsy();

    const tagTest = await db("tag_tests").first();
    expect(tagTest).toBeFalsy();
  });
});

describe("findTag", () => {
  beforeAll(() => db("tags").insert(buildTag({})));

  afterAll(() => db("tags").del());

  it("finds a tag", async () => {
    const tag = await findTag("tagId", { db, logger });

    expect(tag).toMatchObject({ id: "tagId" });
  });

  it("throws an error if tag not found", async () => {
    await expect(
      (async () => {
        return findTag("fakeId", { db, logger });
      })()
    ).rejects.toThrowError("not found");
  });
});

describe("findTagIdsForNames", () => {
  beforeAll(() => {
    return db("tags").insert([
      buildTag({ name: "B Tag" }),
      buildTag({ i: 2, name: "A Tag" }),
      buildTag({ i: 3, name: "C Tag" }),
      buildTag({ i: 4, name: "A Tag", team_id: "team2Id" }),
    ]);
  });

  afterAll(() => db("tags").del());

  it("finds tag ids for names", async () => {
    const tagIds = await findTagIdsForNames(
      { names: "B Tag,A Tag", team_id: "teamId" },
      options
    );

    expect(tagIds).toEqual(["tag2Id", "tagId"]);
  });

  it("tolerates extra whitespace", async () => {
    const tagIds = await findTagIdsForNames(
      { names: "B Tag, A Tag", team_id: "teamId" },
      options
    );

    expect(tagIds).toEqual(["tag2Id", "tagId"]);
  });

  it("throws an error if tag not found", async () => {
    await expect(
      async (): Promise<string[]> => {
        return findTagIdsForNames(
          { names: "A Tag, Missing Tag", team_id: "teamId" },
          options
        );
      }
    ).rejects.toThrowError("not found");
  });
});

describe("findTagsForTeam", () => {
  beforeAll(() => {
    return db("tags").insert([
      buildTag({ name: "B Tag" }),
      buildTag({ i: 2, name: "A Tag" }),
      buildTag({ i: 3, team_id: "team2Id" }),
    ]);
  });

  afterAll(() => db("tags").del());

  it("finds tags for a team", async () => {
    const tags = await findTagsForTeam("teamId", options);

    expect(tags).toMatchObject([{ name: "A Tag" }, { name: "B Tag" }]);
  });
});

describe("findTagsForTests", () => {
  beforeAll(async () => {
    await db("tags").insert([buildTag({}), buildTag({ i: 2 })]);
    await db("tests").insert([
      buildTest({ i: 2 }),
      buildTest({ i: 3 }),
      buildTest({ i: 4 }),
    ]);
  });

  afterAll(async () => {
    await db("tags").del();
    await db("tests").whereIn("id", ["test2Id", "test3Id", "test4Id"]).del();
  });

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

describe("findTagsForTrigger", () => {
  beforeAll(async () => {
    await db("triggers").insert(buildTrigger({}));

    await db("tags").insert([
      buildTag({}),
      buildTag({ i: 2 }),
      buildTag({ i: 3 }),
    ]);

    await db("tag_triggers").insert([
      buildTagTrigger({}),
      buildTagTrigger({ i: 2, tag_id: "tag2Id" }),
    ]);
  });

  afterAll(async () => {
    await db("triggers").del();
    await db("tags").del();
  });

  it("returns tags for a trigger", async () => {
    const tags = await findTagsForTrigger("triggerId", options);

    expect(tags).toMatchObject([{ id: "tagId" }, { id: "tag2Id" }]);
  });
});

describe("updateTag", () => {
  beforeAll(() => {
    return db("tags").insert([buildTag({}), buildTag({ i: 2, name: "Taken" })]);
  });

  afterAll(() => db("tags").del());

  it("updates a tag name", async () => {
    const tag = await updateTag({ id: "tagId", name: "New name" }, options);

    expect(tag.name).toBe("New name");
    expect(tag.created_at).not.toBe(tag.updated_at);

    const dbTag = await db("tags").where({ id: "tagId" }).first();

    expect(dbTag).toMatchObject({
      ...tag,
      updated_at: new Date(tag.updated_at),
    });

    await db("tags")
      .where({ id: "tagId" })
      .update({ name: buildTag({}).name });
  });

  it("throws an error if tag not found", async () => {
    await expect(
      (async (): Promise<Tag> => {
        return updateTag({ id: "fakeId", name: "New name" }, options);
      })()
    ).rejects.toThrowError("not found");
  });

  it("throws an error if tag name taken", async () => {
    await expect(
      (async (): Promise<Tag> => {
        return updateTag({ id: "tagId", name: "Taken" }, options);
      })()
    ).rejects.toThrowError("name must be unique");
  });

  it("throws an error if comma in tag name", async () => {
    await expect(
      (async (): Promise<Tag> => {
        return updateTag({ id: "tagId", name: "this,that" }, options);
      })()
    ).rejects.toThrowError("cannot include commas");
  });
});
