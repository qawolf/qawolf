import * as testModel from "../../../server/models/test";
import { Test } from "../../../server/types";
import * as utils from "../../../server/utils";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildRunner,
  buildTag,
  buildTagTest,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const {
  buildTestName,
  countTestsForTeam,
  createTest,
  countIncompleteTests,
  deleteTests,
  findEnabledTests,
  findEnabledTestsForTags,
  findEnabledTestsForTeam,
  findEnabledTestsForTrigger,
  findPendingTest,
  findTest,
  findTestsForTeam,
  findTests,
  hasIntroGuide,
  hasTest,
  updateTest,
  updateTestToPending,
} = testModel;

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert([buildUser({}), buildUser({ i: 2 })]);
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
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

    const testName = await buildTestName({ team_id: "teamId" }, options);
    expect(testName).toBe("My Test");

    const testName2 = await buildTestName(
      { guide: "Create a Test", team_id: "teamId" },
      options
    );
    expect(testName2).toBe("Guide: Create a Test");
  });

  it("returns incremented name if possible", async () => {
    jest
      .spyOn(testModel, "findTestsForTeam")
      .mockReturnValue(Promise.resolve([{ name: "My Test" }] as Test[]));

    const testName = await buildTestName({ team_id: "teamId" }, options);
    expect(testName).toBe("My Test 2");
  });

  it("returns incremented name if possible and name specified", async () => {
    jest
      .spyOn(testModel, "findTestsForTeam")
      .mockReturnValue(
        Promise.resolve([{ name: "Guide: Create a Test" }] as Test[])
      );

    const testName = await buildTestName(
      { guide: "Create a Test", team_id: "teamId" },
      options
    );
    expect(testName).toBe("Guide: Create a Test 2");
  });

  it("keeps incrementing until unique name found", async () => {
    jest
      .spyOn(testModel, "findTestsForTeam")
      .mockReturnValue(
        Promise.resolve([{ name: "My Test" }, { name: "My Test 2" }] as Test[])
      );

    const testName = await buildTestName({ team_id: "teamId" }, options);
    expect(testName).toBe("My Test 3");
  });
});

describe("countTestsForTeam", () => {
  beforeAll(async () => {
    await db("tests").insert([
      buildTest({}),
      buildTest({ i: 2 }),
      buildTest({ i: 3, guide: "Guide" }),
      buildTest({ i: 4, is_enabled: false }),
      buildTest({ deleted_at: minutesFromNow(), i: 5 }),
    ]);
  });

  afterAll(async () => {
    await db("tests").del();
  });

  it("counts enabled tests", async () => {
    expect(await countTestsForTeam("teamId", options)).toEqual({
      test_enabled_count: 2,
    });
  });
});

describe("createTest", () => {
  afterEach(() => db("tests").del());

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
      guide: null,
      id: expect.any(String),
      is_enabled: true,
      name: "My Test",
      path: null,
      team_id: "teamId",
    });
  });

  it("creates a new test for a guide", async () => {
    await createTest(
      {
        code: "code",
        creator_id: "userId",
        guide: "Create a Test",
        team_id: "teamId",
      },
      options
    );

    const tests = await db.select("*").from("tests").where({ code: "code" });

    expect(tests[0]).toMatchObject({
      guide: "Create a Test",
      name: "Guide: Create a Test",
    });

    const test2 = await createTest(
      {
        code: "code",
        creator_id: "userId",
        guide: "Create a Test",
        team_id: "teamId",
      },
      options
    );

    expect(test2).toMatchObject({
      name: "Guide: Create a Test 2",
    });
  });

  it("creates a test with a specified path", async () => {
    await createTest(
      {
        code: "code",
        path: "myTest.test.js",
        team_id: "teamId",
      },
      options
    );

    const tests = await db.select("*").from("tests").where({ code: "code" });

    expect(tests[0]).toMatchObject({
      code: "code",
      creator_id: null,
      name: null,
      path: "myTest.test.js",
      team_id: "teamId",
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

    // request a runner to make sure it gets cleared after deletion
    await db("tests")
      .where({ id: "deleteMe" })
      .update({ runner_requested_at: new Date().toISOString() });

    const testToDelete = await findTest("deleteMe", options);
    expect(testToDelete.id).toEqual("deleteMe");
    expect(testToDelete.runner_requested_at).toBeTruthy();

    await deleteTests(["deleteMe", "deleteMe2"], options);

    const tests = await db
      .select("*")
      .from("tests")
      .whereIn("id", ["deleteMe", "deleteMe2"]);

    expect(tests).toMatchObject([
      { deleted_at: expect.any(Date), runner_requested_at: null },
      { deleted_at: expect.any(Date) },
    ]);
  });
});

describe("findEnabledTests", () => {
  beforeAll(() => {
    return db("tests").insert([
      buildTest({}),
      buildTest({ deleted_at: new Date().toDateString(), i: 2 }),
      buildTest({ i: 3 }),
      buildTest({ i: 4 }),
      buildTest({ i: 5, is_enabled: false }),
    ]);
  });

  afterAll(() => db("tests").del());

  it("finds enabled and non-deleted tests", async () => {
    const tests = await findEnabledTests(
      ["testId", "test2Id", "test3Id", "test5Id"],
      options
    );

    tests.sort((a, b) => {
      return a < b ? -1 : 1;
    });

    expect(tests).toMatchObject([{ id: "testId" }, { id: "test3Id" }]);
  });
});

describe("findEnabledTestsForTags", () => {
  beforeAll(async () => {
    await db("tests").insert([
      buildTest({}),
      buildTest({ i: 2 }),
      buildTest({ i: 3, is_enabled: false }),
      buildTest({ deleted_at: minutesFromNow(), i: 4 }),
      buildTest({ i: 5, team_id: "team2Id" }),
      buildTest({ i: 6 }),
    ]);

    await db("tags").insert([buildTag({}), buildTag({ i: 2 })]);

    await db("tag_tests").insert([
      buildTagTest({}),
      buildTagTest({ i: 2, tag_id: "tag2Id" }),
      buildTagTest({ i: 3, test_id: "test3Id" }),
      buildTagTest({ i: 4, test_id: "test4Id" }),
      buildTagTest({ i: 5, tag_id: "tag2Id", test_id: "test6Id" }),
    ]);
  });

  afterAll(async () => {
    await db("tags").del();
    await db("tests").del();
  });

  it("returns enabled tests for tag ids", async () => {
    const tests = await findEnabledTestsForTags(
      { tag_ids: ["tagId"], team_id: "teamId" },
      options
    );

    expect(tests).toMatchObject([{ id: "testId" }]);

    const tests2 = await findEnabledTestsForTags(
      { tag_ids: ["tagId", "tag2Id"], team_id: "teamId" },
      options
    );

    expect(tests2).toMatchObject([{ id: "testId" }, { id: "test6Id" }]);
  });

  it("returns enabled tests for tag names", async () => {
    const tests = await findEnabledTestsForTags(
      { tag_names: "tag1", team_id: "teamId" },
      options
    );

    expect(tests).toMatchObject([{ id: "testId" }]);

    const tests2 = await findEnabledTestsForTags(
      { tag_names: "tag1,tag2", team_id: "teamId" },
      options
    );

    expect(tests2).toMatchObject([{ id: "testId" }, { id: "test6Id" }]);
  });

  it("returns enabled tests for team if no tags provided", async () => {
    const tests = await findEnabledTestsForTags({ team_id: "teamId" }, options);

    expect(tests).toMatchObject([
      { id: "testId" },
      { id: "test2Id" },
      { id: "test6Id" },
    ]);
  });
});

describe("findEnabledTestsForTeam", () => {
  beforeAll(async () => {
    await db("tests").insert([
      buildTest({}),
      buildTest({ i: 2 }),
      buildTest({ i: 3, is_enabled: false }),
      buildTest({ deleted_at: minutesFromNow(), i: 4 }),
      buildTest({ i: 5, team_id: "team2Id" }),
    ]);
  });

  afterAll(() => db("tests").del());

  it("finds enabled tests for a team", async () => {
    const tests = await findEnabledTestsForTeam("teamId", options);

    expect(tests).toMatchObject([{ id: "testId" }, { id: "test2Id" }]);
  });
});

describe("findEnabledTestsForTrigger", () => {
  beforeAll(async () => {
    await db("tests").insert([buildTest({}), buildTest({ i: 2 })]);
  });

  afterAll(() => db("tests").del());

  it("finds the enabled tests for a trigger", async () => {
    const tests = await findEnabledTestsForTrigger(buildTrigger({}), options);

    expect(tests).toMatchObject([
      { id: "testId", is_enabled: true, team_id: "teamId" },
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
        runner_requested_branch: "feat-a",
      }),
      buildTest({
        i: 5,
        runner_locations: ["westus2"],
        runner_requested_at: minutesFromNow(),
      }),
    ]);

    await db("runners").insert(buildRunner({ test_id: "testId" }));

    // There was a bug causing update to pending to fail if any
    // runner has `test_id: null`. Keep this here to ensure it
    // does not reappear.
    await db("runners").insert(buildRunner({ i: 2 }));
  });

  afterAll(async () => {
    await db("runners").del();
    await db("tests").del();
  });

  describe("countIncompleteTests", () => {
    it("counts tests assigned to and requesting a runner", async () => {
      const result = await countIncompleteTests("eastus2", options);
      result.sort((a, b) => (a < b ? 1 : -1));

      expect(result).toEqual([
        { count: 2, location: "eastus2" },
        { count: 2, location: "westus2" },
      ]);
    });
  });

  describe("findPendingTest", () => {
    it("returns the first test that requested a runner", async () => {
      const pending = await findPendingTest("eastus2", options);
      expect(pending).toMatchObject({
        id: "test4Id",
        runner_requested_at: expect.any(Date),
        runner_requested_branch: "feat-a",
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
          runner_requested_branch: "main",
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
        runner_requested_branch: "main",
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

describe("findTests", () => {
  beforeAll(() =>
    db("tests").insert([
      buildTest({}),
      buildTest({ i: 2 }),
      buildTest({ deleted_at: new Date().toISOString(), i: 3 }),
    ])
  );

  afterAll(() => db("tests").del());

  it("finds tests by id", async () => {
    const tests = await findTests(["testId", "test3Id"], options);

    expect(tests).toMatchObject([{ id: "testId" }]);
  });
});

describe("hasIntroGuide", () => {
  beforeAll(() =>
    db("tests").insert([
      buildTest({
        guide: "Create a Test",
      }),
      buildTest({ creator_id: "user2Id", i: 2 }),
    ])
  );

  afterAll(() => db("tests").del());

  it("returns true if user has intro guide", async () => {
    expect(await hasIntroGuide("userId", options)).toBe(true);

    await db("tests")
      .update({ deleted_at: new Date().toISOString() })
      .where({ id: "testId" });

    expect(await hasIntroGuide("userId", options)).toBe(true);

    await db("tests").update({ deleted_at: null }).where({ id: "testId" });
  });

  it("returns false if user does not have intro guide", async () => {
    expect(await hasIntroGuide("user2Id", options)).toBe(false);
  });
});

describe("hasTest", () => {
  beforeAll(() => db("tests").insert(buildTest({})));

  afterAll(() => db("tests").del());

  it("returns true if team has test", async () => {
    expect(await hasTest("teamId", options)).toBe(true);
  });

  it("returns false if team has test that is a guide", async () => {
    await db("tests").update({ guide: "Create a Test" });

    expect(await hasTest("teamId", options)).toBe(false);

    await db("tests").update({ guide: null });
  });

  it("returns false if team does not have test", async () => {
    expect(await hasTest("team2Id", options)).toBe(false);
  });
});

describe("updateTest", () => {
  beforeAll(() =>
    db("tests").insert([
      buildTest({
        name: "diffname",
        runner_locations: ["eastus2"],
        runner_requested_at: minutesFromNow(),
        runner_requested_branch: "main",
      }),
      buildTest({ i: 2 }),
      buildTest({ deleted_at: minutesFromNow(), i: 3 }),
    ])
  );

  afterAll(() => db("tests").del());

  it("updates existing test", async () => {
    const test = await updateTest(
      {
        code: "newCode",
        id: "testId",
        is_enabled: true,
        name: "test",
        runner_requested_at: null,
      },
      options
    );

    expect(test).toMatchObject({
      code: "newCode",
      id: "testId",
      is_enabled: true,
      runner_locations: ["eastus2"],
      runner_requested_at: null,
      runner_requested_branch: null,
      name: "test",
    });
  });

  it("updates test name and path", async () => {
    const test = await updateTest(
      {
        id: "testId",
        name: null,
        path: "myTest.test.js",
      },
      options
    );

    expect(test).toMatchObject({
      id: "testId",
      name: null,
      path: "myTest.test.js",
    });

    await updateTest({ id: "testId", name: "test", path: null }, options);
  });

  it("clears existing code", async () => {
    const test = await updateTest(
      {
        code: "",
        id: "testId",
      },
      options
    );

    expect(test).toMatchObject({
      code: "",
      id: "testId",
    });
  });

  it("throws an error if updating to non-unique name", async () => {
    await expect(
      updateTest({ id: "test2Id", name: "test" }, options)
    ).rejects.toThrowError("test name must be unique");
  });

  it("throws an error if test does not exist", async () => {
    await expect(
      updateTest({ code: "code", id: "fakeId" }, options)
    ).rejects.toThrowError("not found");
  });

  it("does not throw an error if test was deleted", async () => {
    const result = await updateTest({ code: "code", id: "test3Id" }, options);

    expect(result).toMatchObject({
      code: "code",
      id: "test3Id",
    });
  });
});
