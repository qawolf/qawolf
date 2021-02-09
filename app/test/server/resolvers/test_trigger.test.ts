import { db, dropTestDb, migrateDb } from "../../../server/db";
import { updateTestTriggersResolver } from "../../../server/resolvers/test_trigger";
import {
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

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

describe("updateTestTriggersResolver", () => {
  beforeAll(async () => {
    await db("triggers").insert([buildTrigger({}), buildTrigger({ i: 2 })]);
    return db("tests").insert([
      buildTest({}),
      buildTest({ i: 2 }),
      buildTest({ i: 3, team_id: "team2Id" }),
    ]);
  });

  afterEach(() => db("test_triggers").del());

  afterAll(async () => {
    await db("triggers").del();
    return db("tests").del();
  });

  it("adds tests to the provided trigger", async () => {
    const addCount = await updateTestTriggersResolver(
      {},
      {
        add_trigger_id: "triggerId",
        remove_trigger_id: null,
        test_ids: ["testId", "test2Id"],
      },
      testContext
    );
    expect(addCount).toBe(2);

    const testTriggers = await db
      .select("*")
      .from("test_triggers")
      .orderBy("test_id", "desc");
    expect(testTriggers).toMatchObject([
      { test_id: "testId", trigger_id: "triggerId" },
      { test_id: "test2Id", trigger_id: "triggerId" },
    ]);
  });

  it("removes tests from the provided trigger", async () => {
    await db("test_triggers").insert([
      { id: "testTriggerId", test_id: "testId", trigger_id: "triggerId" },
      { id: "testTrigger2Id", test_id: "test2Id", trigger_id: "triggerId" },
      { id: "testTrigger3Id", test_id: "testId", trigger_id: "trigger2Id" },
    ]);

    const deleteCount = await updateTestTriggersResolver(
      {},
      {
        add_trigger_id: null,
        remove_trigger_id: "triggerId",
        test_ids: ["testId", "test2Id"],
      },
      testContext
    );
    expect(deleteCount).toBe(2);

    const testTriggers = await db.select("*").from("test_triggers");
    expect(testTriggers).toMatchObject([
      { test_id: "testId", trigger_id: "trigger2Id" },
    ]);
  });

  it("throws an error if no trigger id provided", async () => {
    const testFn = async (): Promise<number> => {
      return updateTestTriggersResolver(
        {},
        { add_trigger_id: null, remove_trigger_id: null, test_ids: ["testId"] },
        testContext
      );
    };

    await expect(testFn()).rejects.toThrowError("add or remove trigger id");
  });

  it("throws an error if trying to add a test from a different team", async () => {
    const testFn = async (): Promise<number> => {
      return updateTestTriggersResolver(
        {},
        {
          add_trigger_id: "triggerId",
          remove_trigger_id: null,
          test_ids: ["test3Id"],
        },
        testContext
      );
    };

    await expect(testFn()).rejects.toThrowError("cannot access test");
  });
});
