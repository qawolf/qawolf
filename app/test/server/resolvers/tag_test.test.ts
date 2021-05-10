import { updateTagTestsResolver } from "../../../server/resolvers/tag_test";
import { TagsForTest } from "../../../server/types";
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
const teams = [buildTeam({}), buildTeam({ i: 2 })];

beforeAll(async () => {
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
  await db("users").insert(buildUser({}));
  await db("team_users").insert([
    buildTeamUser({}),
    buildTeamUser({ i: 2, team_id: "team2Id" }),
  ]);

  await db("tests").insert([
    buildTest({}),
    buildTest({ i: 2, team_id: "team2Id" }),
  ]);
  await db("tags").insert([
    buildTag({}),
    buildTag({ i: 2, team_id: "team2Id" }),
  ]);
});

describe("updateTagTestsResolver", () => {
  afterEach(() => db("tag_tests").del());

  it("allows adding tests to a tag", async () => {
    const tags = await updateTagTestsResolver(
      {},
      { add_tag_id: "tagId", test_ids: ["testId"] },
      context
    );

    expect(tags).toMatchObject([
      { tags: [{ id: "tagId" }], test_id: "testId" },
    ]);
  });

  it("removes tests from a tag", async () => {
    await db("tag_tests").insert(buildTagTest({}));

    const tags = await updateTagTestsResolver(
      {},
      { remove_tag_id: "tagId", test_ids: ["testId"] },
      context
    );

    expect(tags).toMatchObject([{ tags: [], test_id: "testId" }]);
  });

  it("throws an error if trying to add tests to tag on different team", async () => {
    await expect(
      (): Promise<TagsForTest[]> => {
        return updateTagTestsResolver(
          {},
          { add_tag_id: "tag2Id", test_ids: ["testId"] },
          { ...context, teams }
        );
      }
    ).rejects.toThrowError("invalid team");
  });
});
