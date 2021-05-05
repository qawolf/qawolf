import {
  testTriggersResolver,
  updateTestTriggersResolver,
} from "../../../server/resolvers/test_trigger";
import { prepareTestDb } from "../db";
import {
  buildTeam,
  buildTest,
  buildTestTrigger,
  buildTrigger,
  buildUser,
  testContext,
} from "../utils";

const db = prepareTestDb();
const context = { ...testContext, db };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
});

describe("testTriggersResolver", () => {
  beforeAll(async () => {
    await db("triggers").insert([buildTrigger({}), buildTrigger({ i: 2 })]);
    await db("tests").insert(buildTest({}));
    await db("test_triggers").insert(buildTestTrigger());
  });

  afterAll(async () => {
    await db("test_triggers").del();
    await db("triggers").del();
    return db("tests").del();
  });

  it("returns trigger ids for specified tests", async () => {
    const testTriggers = await testTriggersResolver(
      {},
      { test_ids: ["testId"] },
      context
    );

    expect(testTriggers).toEqual([
      { test_id: "testId", trigger_ids: ["triggerId"] },
    ]);
  });
});

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
    const testTriggers = await updateTestTriggersResolver(
      {},
      {
        add_trigger_id: "triggerId",
        remove_trigger_id: null,
        test_ids: ["testId", "test2Id"],
      },
      context
    );
    expect(testTriggers).toEqual([
      { test_id: "testId", trigger_ids: ["triggerId"] },
      { test_id: "test2Id", trigger_ids: ["triggerId"] },
    ]);

    const dbTestTriggers = await db
      .select("*")
      .from("test_triggers")
      .orderBy("test_id", "desc");
    expect(dbTestTriggers).toMatchObject([
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

    const testTriggers = await updateTestTriggersResolver(
      {},
      {
        add_trigger_id: null,
        remove_trigger_id: "triggerId",
        test_ids: ["testId", "test2Id"],
      },
      context
    );

    expect(testTriggers).toEqual([
      { test_id: "testId", trigger_ids: ["trigger2Id"] },
      { test_id: "test2Id", trigger_ids: [] },
    ]);

    const dbTestTriggers = await db.select("*").from("test_triggers");
    expect(dbTestTriggers).toMatchObject([
      { test_id: "testId", trigger_id: "trigger2Id" },
    ]);
  });

  it("throws an error if no trigger id provided", async () => {
    await expect(
      updateTestTriggersResolver(
        {},
        { add_trigger_id: null, remove_trigger_id: null, test_ids: ["testId"] },
        context
      )
    ).rejects.toThrowError("add or remove trigger id");
  });

  it("throws an error if trying to add a test from a different team", async () => {
    await expect(
      updateTestTriggersResolver(
        {},
        {
          add_trigger_id: "triggerId",
          remove_trigger_id: null,
          test_ids: ["test3Id"],
        },
        context
      )
    ).rejects.toThrowError("cannot access test");
  });
});
