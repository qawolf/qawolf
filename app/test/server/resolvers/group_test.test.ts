import { db, dropTestDb, migrateDb } from "../../../server/db";
import { updateGroupTestsResolver } from "../../../server/resolvers/group_test";
import { buildGroup, buildTeam, buildTest, buildUser, logger } from "../utils";

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
});

afterAll(() => dropTestDb());

const testContext = {
  api_key: null,
  ip: "127.0.0.1",
  logger,
  teams: [buildTeam({})],
  user: buildUser({}),
};

describe("updateGroupTestsResolver", () => {
  beforeAll(async () => {
    await db("groups").insert([buildGroup({}), buildGroup({ i: 2 })]);
    return db("tests").insert([
      buildTest({}),
      buildTest({ i: 2 }),
      buildTest({ i: 3, team_id: "team2Id" }),
    ]);
  });

  afterEach(() => db("group_tests").del());

  afterAll(async () => {
    await db("groups").del();
    return db("tests").del();
  });

  it("adds tests to the provided group", async () => {
    const addCount = await updateGroupTestsResolver(
      {},
      {
        add_group_id: "groupId",
        remove_group_id: null,
        test_ids: ["testId", "test2Id"],
      },
      testContext
    );
    expect(addCount).toBe(2);

    const groupTests = await db
      .select("*")
      .from("group_tests")
      .orderBy("test_id", "desc");
    expect(groupTests).toMatchObject([
      { group_id: "groupId", test_id: "testId" },
      { group_id: "groupId", test_id: "test2Id" },
    ]);
  });

  it("removes tests from the provided group", async () => {
    await db("group_tests").insert([
      { group_id: "groupId", id: "groupTestId", test_id: "testId" },
      { group_id: "groupId", id: "groupTest2Id", test_id: "test2Id" },
      { group_id: "group2Id", id: "groupTest3Id", test_id: "testId" },
    ]);

    const deleteCount = await updateGroupTestsResolver(
      {},
      {
        add_group_id: null,
        remove_group_id: "groupId",
        test_ids: ["testId", "test2Id"],
      },
      testContext
    );
    expect(deleteCount).toBe(2);

    const groupTests = await db.select("*").from("group_tests");
    expect(groupTests).toMatchObject([
      { group_id: "group2Id", test_id: "testId" },
    ]);
  });

  it("throws an error if no group id provided", async () => {
    const testFn = async (): Promise<number> => {
      return updateGroupTestsResolver(
        {},
        { add_group_id: null, remove_group_id: null, test_ids: ["testId"] },
        testContext
      );
    };

    await expect(testFn()).rejects.toThrowError("add or remove group id");
  });

  it("throws an error if trying to add a test from a different team", async () => {
    const testFn = async (): Promise<number> => {
      return updateGroupTestsResolver(
        {},
        {
          add_group_id: "groupId",
          remove_group_id: null,
          test_ids: ["test3Id"],
        },
        testContext
      );
    };

    await expect(testFn()).rejects.toThrowError("cannot access test");
  });
});
