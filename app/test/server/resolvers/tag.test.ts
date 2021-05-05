import {
  createTagResolver,
  deleteTagResolver,
  tagsForTestsResolver,
  tagsResolver,
  updateTagResolver,
} from "../../../server/resolvers/tag";
import { prepareTestDb } from "../db";
import {
  buildTag,
  buildTagTest,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildUser,
  testContext,
} from "../utils";

const db = prepareTestDb();
const context = { ...testContext, db };

beforeAll(async () => {
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
  await db("users").insert(buildUser({}));
  return db("team_users").insert(buildTeamUser({}));
});

describe("createTagResolver", () => {
  afterEach(() => db("tags").del());

  it("creates a new tag", async () => {
    const tag = await createTagResolver(
      {},
      { name: "New tag", team_id: "teamId" },
      context
    );

    expect(tag).toMatchObject({ name: "New tag", team_id: "teamId" });
  });
});

describe("deleteTagResolver", () => {
  beforeAll(() => db("tags").insert(buildTag({})));

  afterEach(() => db("tags").del());

  it("deletes a tag", async () => {
    const tag = await deleteTagResolver({}, { id: "tagId" }, context);

    expect(tag).toMatchObject({ id: "tagId" });

    const tags = await db("tags");

    expect(tags).toEqual([]);
  });
});

describe("tagsResolver", () => {
  beforeAll(() =>
    db("tags").insert([buildTag({}), buildTag({ i: 2, team_id: "team2Id" })])
  );

  afterAll(() => db("tags").del());

  it("finds tags for a team", async () => {
    const tags = await tagsResolver({}, { team_id: "teamId" }, context);

    expect(tags).toMatchObject([{ id: "tagId" }]);
  });
});

describe("tagsForTestsResolver", () => {
  beforeAll(async () => {
    await db("tests").insert([
      buildTest({}),
      buildTest({ i: 2 }),
      buildTest({ i: 3 }),
    ]);

    await db("tags").insert([buildTag({}), buildTag({ i: 2 })]);

    await db("tag_tests").insert([
      buildTagTest({}),
      buildTagTest({ i: 2, tag_id: "tag2Id" }),
      buildTagTest({ i: 3, test_id: "test2Id" }),
      buildTagTest({ i: 4, test_id: "test3Id" }),
    ]);
  });

  afterAll(async () => {
    await db("tags").del();
    await db("tests").del();
  });

  it("finds tags for tests", async () => {
    const tags = await tagsForTestsResolver(
      {},
      { test_ids: ["testId", "test2Id"] },
      context
    );

    expect(tags).toMatchObject([
      { tags: [{ id: "tagId" }, { id: "tag2Id" }], test_id: "testId" },
      { tags: [{ id: "tagId" }], test_id: "test2Id" },
    ]);
  });
});

describe("updateTagResolver", () => {
  beforeAll(() => db("tags").insert(buildTag({})));

  afterAll(() => db("tags").del());

  it("updates a tag", async () => {
    const tag = await updateTagResolver(
      {},
      { id: "tagId", name: "New name" },
      context
    );

    expect(tag).toMatchObject({ id: "tagId", name: "New name" });
  });
});
