import { db, dropTestDb, migrateDb } from "../../../server/db";
import * as testModel from "../../../server/models/test";
import { updateTestToPending } from "../../../server/models/test";
import { Test } from "../../../server/types";
import * as utils from "../../../server/utils";
import { minutesFromNow } from "../../../shared/utils";
import {
  buildGroup,
  buildRun,
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

  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));
  await db("groups").insert(buildGroup({}));
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

describe("createTestAndGroupTests", () => {
  beforeAll(() => db("groups").insert(buildGroup({ i: 2 })));

  afterAll(async () => {
    await db("group_tests").del();
    await db("groups").where({ id: "group2Id" }).del();
    await db("tests").del();
  });

  it("creates a new test", async () => {
    await createTestAndGroupTests(
      {
        code: "code",
        creator_id: "userId",
        group_ids: ["groupId", "group2Id"],
        team_id: "teamId",
        url: "https://qawolf.com",
      },
      { logger }
    );

    const tests = await db
      .select("*")
      .from("tests")
      .where({ url: "https://qawolf.com" });

    expect(tests[0]).toMatchObject({
      team_id: "teamId",
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
  afterAll(async () => {
    await db("group_tests").del();
    await db("tests").del();
  });

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
        team_id: "teamId",
        url: "https://qawolf.com",
      },
      { logger }
    );

    await createTestAndGroupTests(
      {
        code: "code",
        creator_id: "userId",
        group_ids: ["groupId"],
        team_id: "teamId",
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
  beforeAll(async () => {
    await db("tests").insert([buildTest({}), buildTest({ i: 2 })]);

    await db("group_tests").insert([
      {
        group_id: "groupId",
        id: "groupTestId",
        test_id: "testId",
      },
      {
        group_id: "groupId",
        id: "groupTest2Id",
        test_id: "test2Id",
      },
    ]);
  });

  afterAll(async () => {
    await db("group_tests").del();
    await db("tests").del();
  });

  it("finds the enabled tests for a group", async () => {
    const tests = await findEnabledTestsForGroup(
      { group_id: "groupId" },
      { logger }
    );

    expect(tests).toMatchObject([
      { id: "testId", is_enabled: true, team_id: "teamId" },
      { id: "test2Id", is_enabled: true, team_id: "teamId" },
    ]);
  });

  it("filters by test id if specified", async () => {
    const tests = await findEnabledTestsForGroup(
      { group_id: "groupId", test_ids: ["test2Id"] },
      { logger }
    );

    expect(tests).toMatchObject([
      { id: "test2Id", is_enabled: true, team_id: "teamId" },
    ]);
  });
});

describe("pending tests", () => {
  beforeAll(async () => {
    await db("tests").insert([
      buildTest({}),
      buildTest({ i: 2 }),
      buildTest({
        i: 3,
        runner_locations: ["eastus2"],
        runner_requested_at: minutesFromNow(1),
      }),
      buildTest({
        i: 4,
        runner_locations: ["eastus2"],
        runner_requested_at: minutesFromNow(),
      }),
      buildTest({
        i: 5,
        runner_locations: ["westus2"],
        runner_requested_at: minutesFromNow(),
      }),
    ]);

    await db("runners").insert(buildRunner({ test_id: "testId" }));
  });

  afterAll(async () => {
    await db("runners").del();
    await db("tests").del();
  });

  describe("countPendingTests", () => {
    it("counts tests that requested a runner", async () => {
      const result = await countPendingTests("eastus2", { logger });
      expect(result).toEqual([
        { count: 2, location: "eastus2" },
        { count: 1, location: "westus2" },
      ]);
    });
  });

  describe("findPendingTest", () => {
    it("returns the first test that requested a runner", async () => {
      const pending = await findPendingTest("eastus2", { logger });
      expect(pending).toMatchObject({
        id: "test4Id",
        runner_requested_at: expect.any(Date),
      });
    });
  });

  describe("updateTestToPending", () => {
    it("does not update a test that is assigned a runner", async () => {
      const didUpdate = await updateTestToPending(
        { id: "testId", runner_locations: ["eastus2"] },
        { logger }
      );
      expect(didUpdate).toEqual(false);
    });

    it("does not update a test that is already pending", async () => {
      const didUpdate = await updateTestToPending(
        { id: "test3Id", runner_locations: ["eastus2"] },
        { logger }
      );
      expect(didUpdate).toEqual(false);
    });

    it("updates the test to pending", async () => {
      const didUpdate = await updateTestToPending(
        {
          id: "test2Id",
          runner_locations: ["westus2", "eastus2", "centralindia"],
        },
        { logger }
      );
      expect(didUpdate).toEqual(true);

      const result = await findTest("test2Id", { logger });
      expect(result).toMatchObject({
        id: "test2Id",
        // check it only uses the first two locations
        runner_locations: ["westus2", "eastus2"],
        runner_requested_at: expect.any(Date),
      });
    });
  });
});

describe("findTest", () => {
  beforeAll(() =>
    db("tests").insert([
      buildTest({}),
      buildTest({
        deleted_at: minutesFromNow(),
        i: 2,
      }),
    ])
  );

  afterAll(() => db("tests").del());

  it("returns test if it exists", async () => {
    const test = await findTest("testId", { logger });

    expect(test).toMatchObject({
      team_id: "teamId",
      code: 'const x = "hello"',
      creator_id: "userId",
      id: "testId",
      runner_locations: null,
      url: "https://github.com",
      version: 11,
    });
  });

  it("returns deleted test", async () => {
    const test = await findTest("test2Id", { logger });

    expect(test).toMatchObject({ id: "test2Id" });
  });

  it("throws an error if test does not exist", async () => {
    await expect(findTest("fakeId", { logger })).rejects.toThrowError(
      "test not found fakeId"
    );
  });
});

describe("findTestForRun", () => {
  beforeAll(async () => {
    await db("tests").insert(buildTest({}));
    await db("runs").insert(buildRun({}));
  });

  afterAll(async () => {
    await db("runs").del();
    await db("tests").del();
  });

  it("returns test for a given run", async () => {
    const test = await findTestForRun("runId", { logger });
    expect(test).toMatchObject({ id: "testId" });
  });

  it("throws an error if run does not exist", async () => {
    await expect(findTestForRun("fakeId", { logger })).rejects.toThrowError(
      "test for run not found fakeId"
    );
  });
});

describe("findTestsForGroup", () => {
  beforeAll(async () => {
    await db("tests").insert([
      buildTest({}),
      buildTest({ deleted_at: minutesFromNow(), i: 2 }),
    ]);

    return db("group_tests").insert([
      { group_id: "groupId", id: "groupTestId", test_id: "testId" },
      { group_id: "groupId", id: "groupTest2Id", test_id: "test2Id" },
    ]);
  });

  afterAll(async () => {
    await db("group_tests").del();
    await db("tests").del();
  });

  it("returns the non-deleted tests of a group", async () => {
    const tests = await findTestsForGroup("groupId", { logger });

    expect(tests).toMatchObject([{ id: "testId" }]);
  });

  it("returns empty list if no tests for group exist", async () => {
    const tests = await findTestsForGroup("fakeId", { logger });

    expect(tests).toEqual([]);
  });
});

describe("findTestsForTeam", () => {
  beforeAll(() => db("tests").insert(buildTest({})));

  afterAll(() => db("tests").del());

  it("returns list of tests for an team", async () => {
    const tests = await findTestsForTeam("teamId", { logger });

    expect(tests).toMatchObject([{ creator_id: "userId", id: "testId" }]);
  });

  it("returns empty list if no tests for user exist", async () => {
    const tests = await findTestsForTeam("fakeId", { logger });

    expect(tests).toEqual([]);
  });
});

describe("updateTest", () => {
  beforeAll(() =>
    db("tests").insert([
      buildTest({
        name: "diffname",
        runner_locations: ["eastus2"],
        runner_requested_at: minutesFromNow(),
        version: 2,
      }),
      buildTest({ i: 2 }),
      buildTest({ deleted_at: minutesFromNow(), i: 3 }),
    ])
  );

  afterAll(() => db("tests").del());

  it("does not update test if newer version saved", async () => {
    const test = await updateTest(
      {
        code: "code",
        id: "testId",
        version: 1,
      },
      { logger }
    );

    expect(test).toMatchObject({
      code: 'const x = "hello"',
      id: "testId",
      version: 2,
    });
  });

  it("updates existing test", async () => {
    const test = await updateTest(
      {
        code: "newCode",
        id: "testId",
        is_enabled: true,
        name: "test",
        runner_requested_at: null,
        version: 13,
      },
      { logger }
    );

    expect(test).toMatchObject({
      code: "newCode",
      id: "testId",
      is_enabled: true,
      runner_locations: ["eastus2"],
      runner_requested_at: null,
      name: "test",
      version: 13,
    });
  });

  it("throws an error if updating to non-unique name", async () => {
    await expect(
      updateTest({ id: "test2Id", name: "test" }, { logger })
    ).rejects.toThrowError("test name must be unique");
  });

  it("throws an error if test does not exist", async () => {
    await expect(
      updateTest({ code: "code", id: "fakeId", version: 1 }, { logger })
    ).rejects.toThrowError("not found");
  });

  it("does not throw an error if test was deleted", async () => {
    const result = await updateTest(
      { code: "code", id: "test3Id", version: 12 },
      { logger }
    );

    expect(result).toMatchObject({
      code: "code",
      id: "test3Id",
      version: 12,
    });
  });
});
