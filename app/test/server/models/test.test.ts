import * as testModel from "../../../server/models/test";
import { updateTestToPending } from "../../../server/models/test";
import { Test } from "../../../server/types";
import * as utils from "../../../server/utils";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildRun,
  buildRunner,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const {
  buildTestName,
  createTest,
  countPendingTests,
  deleteTests,
  findEnabledTestsForTrigger,
  findPendingTest,
  findTest,
  findTestForRun,
  findTestsForTeam,
  updateTest,
} = testModel;

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));
  await db("triggers").insert(buildTrigger({}));
});

afterAll(() => jest.restoreAllMocks());

describe("buildTestName", () => {
  afterAll(() => {
    jest.spyOn(testModel, "findTestsForTeam").mockRestore();
  });

  it("returns default name if no tests", async () => {
    jest
      .spyOn(testModel, "findTestsForTeam")
      .mockReturnValue(Promise.resolve([]));

    const testName = await buildTestName("teamId", options);
    expect(testName).toBe("My Test");
  });

  it("returns incremented name if possible", async () => {
    jest
      .spyOn(testModel, "findTestsForTeam")
      .mockReturnValue(Promise.resolve([{ name: "My Test" }] as Test[]));

    const testName = await buildTestName("teamId", options);
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

    const testName = await buildTestName("teamId", options);
    expect(testName).toBe("My Test 5");
  });
});

describe("createTest", () => {
  afterAll(() => db("tests").del());

  it("creates a new test", async () => {
    await createTest(
      {
        code: "code",
        creator_id: "userId",
        team_id: "teamId",
      },
      options
    );

    const tests = await db.select("*").from("tests").where({ code: "code" });

    expect(tests[0]).toMatchObject({
      code: "code",
      creator_id: "userId",
      deleted_at: null,
      id: expect.any(String),
      is_enabled: true,
      name: "My Test",
      team_id: "teamId",
      version: 0,
    });
  });
});

describe("deleteTests", () => {
  afterAll(async () => {
    await db("test_triggers").del();
    await db("tests").del();
  });

  it("deletes the specified tests", async () => {
    jest
      .spyOn(utils, "cuid")
      .mockReturnValueOnce("deleteMe")
      .mockReturnValue("deleteMe2");

    await createTest(
      {
        code: "code",
        creator_id: "userId",
        team_id: "teamId",
      },
      options
    );

    await createTest(
      {
        code: "code",
        creator_id: "userId",
        team_id: "teamId",
      },
      options
    );

    const testToDelete = await findTest("deleteMe", options);
    expect(testToDelete).toMatchObject({ id: "deleteMe" });

    await deleteTests(["deleteMe", "deleteMe2"], options);

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

describe("findEnabledTestsForTrigger", () => {
  beforeAll(async () => {
    await db("tests").insert([buildTest({}), buildTest({ i: 2 })]);

    await db("test_triggers").insert([
      {
        id: "testTriggerId",
        test_id: "testId",
        trigger_id: "triggerId",
      },
      {
        id: "testTrigger2Id",
        test_id: "test2Id",
        trigger_id: "triggerId",
      },
    ]);
  });

  afterAll(async () => {
    await db("test_triggers").del();
    await db("tests").del();
  });

  it("finds the enabled tests for a trigger", async () => {
    const tests = await findEnabledTestsForTrigger(
      { trigger_id: "triggerId" },
      options
    );

    expect(tests).toMatchObject([
      { id: "testId", is_enabled: true, team_id: "teamId" },
      { id: "test2Id", is_enabled: true, team_id: "teamId" },
    ]);
  });

  it("filters by test id if specified", async () => {
    const tests = await findEnabledTestsForTrigger(
      { trigger_id: "triggerId", test_ids: ["test2Id"] },
      options
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
      const result = await countPendingTests("eastus2", options);
      expect(result).toEqual([
        { count: 2, location: "eastus2" },
        { count: 1, location: "westus2" },
      ]);
    });
  });

  describe("findPendingTest", () => {
    it("returns the first test that requested a runner", async () => {
      const pending = await findPendingTest("eastus2", options);
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
        options
      );
      expect(didUpdate).toEqual(false);
    });

    it("does not update a test that is already pending", async () => {
      const didUpdate = await updateTestToPending(
        { id: "test3Id", runner_locations: ["eastus2"] },
        options
      );
      expect(didUpdate).toEqual(false);
    });

    it("updates the test to pending", async () => {
      const didUpdate = await updateTestToPending(
        {
          id: "test2Id",
          runner_locations: ["westus2", "eastus2", "centralindia"],
        },
        options
      );
      expect(didUpdate).toEqual(true);

      const result = await findTest("test2Id", options);
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
    const test = await findTest("testId", options);

    expect(test).toMatchObject({
      team_id: "teamId",
      code: 'const x = "hello"',
      creator_id: "userId",
      id: "testId",
      runner_locations: null,
      version: 11,
    });
  });

  it("returns deleted test", async () => {
    const test = await findTest("test2Id", options);

    expect(test).toMatchObject({ id: "test2Id" });
  });

  it("throws an error if test does not exist", async () => {
    await expect(findTest("fakeId", options)).rejects.toThrowError(
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
    const test = await findTestForRun("runId", options);
    expect(test).toMatchObject({ id: "testId" });
  });

  it("throws an error if run does not exist", async () => {
    await expect(findTestForRun("fakeId", options)).rejects.toThrowError(
      "test for run not found fakeId"
    );
  });
});

describe("findTestsForTeam", () => {
  beforeAll(() => db("tests").insert(buildTest({})));

  afterAll(() => db("tests").del());

  it("returns list of tests for an team", async () => {
    const tests = await findTestsForTeam("teamId", options);

    expect(tests).toMatchObject([{ creator_id: "userId", id: "testId" }]);
  });

  it("returns empty list if no tests for team exist", async () => {
    const tests = await findTestsForTeam("fakeId", options);

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
      options
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
      options
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
      updateTest({ id: "test2Id", name: "test" }, options)
    ).rejects.toThrowError("test name must be unique");
  });

  it("throws an error if test does not exist", async () => {
    await expect(
      updateTest({ code: "code", id: "fakeId", version: 1 }, options)
    ).rejects.toThrowError("not found");
  });

  it("does not throw an error if test was deleted", async () => {
    const result = await updateTest(
      { code: "code", id: "test3Id", version: 12 },
      options
    );

    expect(result).toMatchObject({
      code: "code",
      id: "test3Id",
      version: 12,
    });
  });
});
