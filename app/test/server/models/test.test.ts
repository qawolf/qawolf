import { db, dropTestDb, migrateDb } from "../../../server/db";
import * as testModel from "../../../server/models/test";
import { Test } from "../../../server/types";
import * as utils from "../../../server/utils";
import { minutesFromNow } from "../../../server/utils";
import {
  buildGroup,
  buildRunner,
  buildTeam,
  buildTest,
  buildUser,
  logger,
} from "../utils";

const {
  buildTestName,
  createTestAndGroupTests,
  countPendingTests,
  deleteTests,
  findEnabledTestsForGroup,
  findPendingTest,
  findTest,
  findTestForRun,
  findTestsForGroup,
  findTestsForTeam,
  updateTest,
} = testModel;

beforeAll(async () => {
  await migrateDb();

  return db.transaction(async (trx) => {
    await trx("runners").insert(buildRunner({}));

    await trx("users").insert([buildUser({}), buildUser({ i: 2 })]);
    await trx("teams").insert([
      buildTeam({}),
      buildTeam({ i: 2 }),
      buildTeam({ i: 3 }),
    ]);
    await trx("groups").insert(buildGroup({}));

    await trx("tests").insert([
      buildTest({
        creator_id: "user2Id",
        runner_locations: ["eastus2"],
        runner_requested_at: minutesFromNow(1),
      }),
      buildTest({
        code: 'const x = "world"',
        creator_id: "userId",
        i: 2,
        runner_locations: ["eastus2"],
        runner_requested_at: minutesFromNow(),
        team_id: "team2Id",
        version: 0,
      }),
      buildTest({
        code: 'const x = "!"',
        creator_id: "userId",
        i: 3,
        is_enabled: false,
        team_id: "team2Id",
        version: 1,
      }),
      buildTest({
        code: "deleted code",
        creator_id: "userId",
        deleted_at: minutesFromNow(),
        id: "deletedId",
        name: "deleted",
        runner_requested_at: minutesFromNow(),
        team_id: "team2Id",
        version: 8,
      }),
    ]);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
  return dropTestDb();
});

describe("buildTestName", () => {
  afterAll(() => {
    jest.spyOn(testModel, "findTestsForTeam").mockRestore();
  });

  it("returns default name if no tests", async () => {
    jest
      .spyOn(testModel, "findTestsForTeam")
      .mockReturnValue(Promise.resolve([]));

    const testName = await buildTestName({ team_id: "teamId" }, { logger });
    expect(testName).toBe("My Test");
  });

  it("returns specified name if possible", async () => {
    jest
      .spyOn(testModel, "findTestsForTeam")
      .mockReturnValue(Promise.resolve([]));

    const testName = await buildTestName(
      { name: "Test Name", team_id: "teamId" },
      { logger }
    );
    expect(testName).toBe("Test Name");
  });

  it("returns default name if specified name not possible", async () => {
    jest
      .spyOn(testModel, "findTestsForTeam")
      .mockReturnValue(Promise.resolve([{ name: "My Test" }] as Test[]));

    const testName = await buildTestName(
      { name: "My Test", team_id: "teamId" },
      { logger }
    );
    expect(testName).toBe("My Test 2");
  });

  it("returns incremented name if possible", async () => {
    jest
      .spyOn(testModel, "findTestsForTeam")
      .mockReturnValue(Promise.resolve([{ name: "My Test" }] as Test[]));

    const testName = await buildTestName({ team_id: "teamId" }, { logger });
    expect(testName).toBe("My Test 2");
  });

  it("keeps incrementing until unique name found", async () => {
    jest
      .spyOn(testModel, "findTestsForTeam")
      .mockReturnValue(
        Promise.resolve([
          { name: "My Test 3" },
          { name: "My Test 4" },
        ] as Test[])
      );

    const testName = await buildTestName({ team_id: "teamId" }, { logger });
    expect(testName).toBe("My Test 5");
  });
});

describe("countPendingTests", () => {
  it("counts tests that requested a runner", async () => {
    const result = await countPendingTests("eastus2", { logger });
    expect(result).toEqual([{ count: 2, location: "eastus2" }]);
  });
});

describe("createTestAndGroupTests", () => {
  beforeAll(() => db("groups").insert(buildGroup({ i: 2 })));

  afterAll(() => db("groups").where({ id: "group2Id" }).del());

  it("creates a new test", async () => {
    await createTestAndGroupTests(
      {
        code: "code",
        creator_id: "userId",
        group_ids: ["groupId", "group2Id"],
        team_id: "team3Id",
        url: "https://qawolf.com",
      },
      { logger }
    );

    const tests = await db
      .select("*")
      .from("tests")
      .where({ url: "https://qawolf.com" });

    expect(tests[0]).toMatchObject({
      team_id: "team3Id",
      code: "code",
      creator_id: "userId",
      deleted_at: null,
      id: expect.any(String),
      is_enabled: true,
      name: "My Test",
      url: "https://qawolf.com",
      version: 0,
    });

    const groupTests = await db.select("*").from("group_tests");

    expect(groupTests).toMatchObject([
      { group_id: "groupId", test_id: tests[0].id },
      { group_id: "group2Id", test_id: tests[0].id },
    ]);
  });
});

describe("deleteTests", () => {
  it("deletes the specified tests", async () => {
    jest
      .spyOn(utils, "cuid")
      .mockReturnValueOnce("deleteMe")
      .mockReturnValueOnce("deleteMeGroupTest")
      .mockReturnValue("deleteMe2");

    await createTestAndGroupTests(
      {
        code: "code",
        creator_id: "userId",
        group_ids: ["groupId"],
        team_id: "team3Id",
        url: "https://qawolf.com",
      },
      { logger }
    );

    await createTestAndGroupTests(
      {
        code: "code",
        creator_id: "userId",
        group_ids: ["groupId"],
        team_id: "team3Id",
        url: "https://qawolf.com",
      },
      { logger }
    );

    const testToDelete = await findTest("deleteMe", { logger });
    expect(testToDelete).toMatchObject({ id: "deleteMe" });

    await deleteTests(["deleteMe", "deleteMe2"], { logger });

    const tests = await db
      .select("*")
      .from("tests")
      .whereIn("id", ["deleteMe", "deleteMe2"]);

    expect(tests).toMatchObject([
      { deleted_at: expect.any(Date) },
      { deleted_at: expect.any(Date) },
    ]);
  });
});

describe("findEnabledTestsForGroup", () => {
  it("finds the enabled tests for a group", async () => {
    const tests = await findEnabledTestsForGroup(
      { group_id: "groupId" },
      { logger }
    );

    expect(tests).toMatchObject([{ is_enabled: true, team_id: "team3Id" }]);
  });

  it("filters by test id if specified", async () => {
    await db("tests").insert(
      buildTest({
        code: 'const y = "?"',
        creator_id: "userId",
        i: 4,
        is_enabled: true,
        team_id: "team3Id",
        version: 1,
      })
    );
    await db("group_tests").insert({
      group_id: "groupId",
      id: "groupTest2Id",
      test_id: "test4Id",
    });

    const tests = await findEnabledTestsForGroup(
      { group_id: "groupId", test_ids: ["test4Id"] },
      { logger }
    );

    expect(tests).toMatchObject([
      { id: "test4Id", is_enabled: true, team_id: "team3Id" },
    ]);

    await db("group_tests").where({ id: "groupTest2Id" }).del();
    await db("tests").where({ id: "test4Id" }).del();
  });
});

describe("findPendingTest", () => {
  it("returns the first test that requested a runner", async () => {
    const pending = await findPendingTest("eastus2", { logger });
    expect(pending).toMatchObject({
      id: "test2Id",
      runner_requested_at: expect.any(Date),
    });
  });
});

describe("findTest", () => {
  it("returns test if it exists", async () => {
    const test = await findTest("testId", { logger });

    expect(test).toMatchObject({
      team_id: "teamId",
      code: 'const x = "hello"',
      creator_id: "user2Id",
      id: "testId",
      url: "https://github.com",
      version: 11,
    });
  });

  it("returns deleted test", async () => {
    const test = await findTest("deletedId", { logger });

    expect(test).toMatchObject({ id: "deletedId" });
  });

  it("throws an error if test does not exist", async () => {
    await expect(findTest("fakeId", { logger })).rejects.toThrowError(
      "test not found fakeId"
    );
  });
});

describe("findTestForRun", () => {
  beforeAll(() => {
    return db("runs").insert({
      id: "runId",
      status: "created",
      test_id: "testId",
    });
  });

  afterAll(() => db("runs").del());

  it("returns test for a given run", async () => {
    const test = await findTestForRun("runId", { logger });
    expect(test).toMatchObject({ creator_id: "user2Id", id: "testId" });
  });

  it("throws an error if run does not exist", async () => {
    await expect(findTestForRun("fakeId", { logger })).rejects.toThrowError(
      "test for run not found fakeId"
    );
  });
});

describe("findTestsForGroup", () => {
  beforeAll(() => {
    return db("group_tests").insert([
      { group_id: "groupId", id: "groupTest2Id", test_id: "test2Id" },
      { group_id: "groupId", id: "groupTest3Id", test_id: "deletedId" },
    ]);
  });

  afterAll(() => db("group_tests").del());

  it("returns list of tests for a group", async () => {
    const tests = await findTestsForGroup("groupId", { logger });

    expect(tests).toMatchObject([{ team_id: "team3Id" }, { id: "test2Id" }]);
  });

  it("returns empty list if no tests for group exist", async () => {
    const tests = await findTestsForGroup("fakeId", { logger });

    expect(tests).toEqual([]);
  });
});

describe("findTestsForTeam", () => {
  it("returns list of tests for an team", async () => {
    const tests = await db.transaction(async (trx) => {
      await trx("tests")
        .update({ created_at: new Date("2020-01-01").toISOString() })
        .where({ id: "test2Id" });

      return findTestsForTeam("team2Id", { logger, trx });
    });

    expect(tests).toMatchObject([
      { creator_id: "userId", id: "test2Id" },
      { creator_id: "userId", id: "test3Id" },
    ]);
  });

  it("returns empty list if no tests for user exist", async () => {
    const tests = await findTestsForTeam("fakeId", { logger });

    expect(tests).toEqual([]);
  });
});

describe("updateTest", () => {
  it("does not update test if newer version saved", async () => {
    const test = await updateTest(
      {
        code: "code",
        id: "testId",
        version: 8,
      },
      { logger }
    );

    expect(test).toMatchObject({
      code: 'const x = "hello"',
      id: "testId",
      version: 11,
    });
  });

  it("updates existing test", async () => {
    const now = minutesFromNow();

    const test = await updateTest(
      {
        code: "newCode",
        id: "testId",
        is_enabled: true,
        runner_locations: ["eastus2", "westus2"],
        runner_requested_at: now,
        name: "newName",
        version: 13,
      },
      { logger }
    );

    expect(test).toMatchObject({
      code: "newCode",
      id: "testId",
      is_enabled: true,
      runner_locations: '["eastus2","westus2"]',
      runner_requested_at: now,
      name: "newName",
      version: 13,
    });

    const test2 = await updateTest(
      {
        id: "testId",
        runner_locations: null,
        runner_requested_at: null,
      },
      { logger }
    );
    expect(test2).toMatchObject({
      runner_locations: null,
      runner_requested_at: null,
    });
  });

  it("throws an error if updating to non-unique name", async () => {
    const testFn = async (): Promise<Test> => {
      return updateTest({ id: "test3Id", name: "test2" }, { logger });
    };

    await expect(testFn()).rejects.toThrowError("test name must be unique");
  });

  it("throws an error if test does not exist", async () => {
    const testFn = async (): Promise<Test> => {
      return updateTest({ code: "code", id: "fakeId", version: 1 }, { logger });
    };

    await expect(testFn()).rejects.toThrowError("not found");
  });

  it("does not throw an error if test was deleted", async () => {
    const testFn = async (): Promise<Test> => {
      return updateTest(
        { code: "code", id: "deletedId", version: 12 },
        { logger }
      );
    };

    await expect(testFn()).resolves.not.toThrowError("not found");
  });
});
