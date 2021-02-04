import { db, dropTestDb, migrateDb } from "../../../server/db";
import * as runModel from "../../../server/models/run";
import * as testModel from "../../../server/models/test";
import * as testResolvers from "../../../server/resolvers/test";
import * as azure from "../../../server/services/aws/storage";
import {
  Context,
  SuiteRun,
  Team,
  Test,
  TestResult,
} from "../../../server/types";
import { minutesFromNow } from "../../../shared/utils";
import {
  buildGroup,
  buildRun,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildUser,
  logger,
} from "../utils";

const {
  createTestResolver,
  deleteTestsResolver,
  findGroupIdsAndTeamForCreateTest,
  testResolver,
  testSummaryResolver,
  testsResolver,
  updateTestResolver,
} = testResolvers;

const run = buildRun({ code: "run code" });
const testContext = {
  api_key: null,
  ip: "127.0.0.1",
  logger,
  teams: [buildTeam({})],
  user: buildUser({}),
};

beforeAll(async () => {
  await migrateDb();

  return db.transaction(async (trx) => {
    await trx("users").insert([buildUser({}), buildUser({ i: 2 })]);
    await trx("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
    await trx("team_users").insert([
      buildTeamUser({}),
      buildTeamUser({ i: 2, team_id: "team2Id", user_id: "user2Id" }),
    ]);

    await trx("groups").insert([
      buildGroup({}),
      buildGroup({ i: 2, team_id: "team2Id" }),
      buildGroup({ i: 3, is_default: true, name: "All Tests" }),
    ]);

    await trx("tests").insert([
      buildTest({ creator_id: "userId" }),
      buildTest({
        creator_id: "user2Id",
        id: "deleteMe",
        i: 2,
        team_id: "team2Id",
      }),
      buildTest({
        creator_id: "user2Id",
        i: 3,
        team_id: "team2Id",
      }),
    ]);

    await trx("group_tests").insert([
      {
        group_id: "groupId",
        id: "groupTestId",
        test_id: "testId",
      },
      {
        group_id: "groupId",
        id: "groupTest2Id",
        test_id: "deleteMe",
      },
    ]);

    return trx("runs").insert(run);
  });
});

afterAll(() => dropTestDb());

describe("createTestResolver", () => {
  afterAll(jest.clearAllMocks);

  it("creates a test", async () => {
    const test = await createTestResolver(
      {},
      { group_id: "groupId", url: "https://google.com" },
      testContext
    );

    expect(test).toMatchObject({
      team_id: "teamId",
      creator_id: "userId",
      id: expect.any(String),
      name: "My Test 2",
      url: "https://google.com",
    });

    await db("group_tests").where({ test_id: test.id }).del();
    await db("tests").where({ id: test.id }).del();
  });

  it("throws an error if testing qawolf.com", async () => {
    const testFn = async (): Promise<Test> => {
      return createTestResolver(
        {},
        { group_id: "groupId", url: "https://qawolf.com" },
        testContext
      );
    };

    await expect(testFn()).rejects.toThrowError(
      "recursion requires an enterprise plan"
    );
  });
});

describe("deleteTestsResolver", () => {
  it("deletes a test", async () => {
    const tests = await deleteTestsResolver(
      {},
      { ids: ["deleteMe"] },
      {
        ...testContext,
        teams: [buildTeam({ i: 2 })],
        user: buildUser({ i: 2 }),
      }
    );

    expect(tests).toMatchObject([
      {
        creator_id: "user2Id",
        id: "deleteMe",
      },
    ]);

    const test = await testModel.findTest("deleteMe", { logger });
    expect(test.deleted_at).not.toBeNull();

    const groupTest = await db
      .select("*")
      .from("group_tests")
      .where("test_id", "deleteMe")
      .first();
    expect(groupTest).toBeFalsy();
  });
});

describe("findGroupIdsAndTeamForCreateTest", () => {
  it("returns group id and default group id if applicable", async () => {
    const result = await findGroupIdsAndTeamForCreateTest({
      logger,
      group_id: "groupId",
      teams: testContext.teams,
    });

    result.groupIds.sort();

    expect(result).toMatchObject({
      groupIds: ["group3Id", "groupId"],
      team: testContext.teams[0],
    });
  });

  it("returns group id if default group provided", async () => {
    const result = await findGroupIdsAndTeamForCreateTest({
      logger,
      group_id: "group3Id",
      teams: testContext.teams,
    });

    expect(result).toMatchObject({
      groupIds: ["group3Id"],
      team: testContext.teams[0],
    });
  });

  it("returns default group otherwise", async () => {
    const result = await findGroupIdsAndTeamForCreateTest({
      logger,
      group_id: null,
      teams: testContext.teams,
    });

    expect(result).toMatchObject({
      groupIds: ["group3Id"],
      team: testContext.teams[0],
    });
  });

  it("throws an error if user on multiple teams and no group provided", async () => {
    const testFn = async (): Promise<{
      groupIds: string[];
      team: Team;
    }> => {
      return findGroupIdsAndTeamForCreateTest({
        logger,
        group_id: null,
        teams: [...testContext.teams, buildTeam({ i: 2 })],
      });
    };

    await expect(testFn()).rejects.toThrowError("not specified");
  });
});

describe("testResolver", () => {
  it("finds a test by id", async () => {
    const result = await testResolver({}, { id: "testId" }, testContext);
    expect(result).toMatchObject({
      run: null,
      test: {
        team_id: "teamId",
        creator_id: "userId",
        code: 'const x = "hello"',
        id: "testId",
        url: "https://github.com",
      },
    });
  });

  it("finds a test by run id", async () => {
    jest.spyOn(azure, "createStorageReadAccessUrl").mockReturnValue("url");

    await db("runs")
      .where({ id: "runId" })
      .update({ completed_at: minutesFromNow() });

    const result = await testResolver({}, { run_id: "runId" }, testContext);

    expect(result).toMatchObject({
      run: {
        environment_id: null,
        id: "runId",
        logs_url: "url",
        video_url: "url",
      },
      test: {
        team_id: "teamId",
        creator_id: "userId",
        code: 'const x = "hello"',
        id: "testId",
        url: "https://github.com",
      },
    });
  });

  it("throws an error if user does not have access", async () => {
    const testFn = async (): Promise<TestResult> => {
      return testResolver(
        {},
        { id: "testId" },
        { api_key: null, ip: null, logger, teams: null, user: null }
      );
    };

    await expect(testFn()).rejects.toThrowError("no teams");
  });

  it("throws an error if user passes both test id and run id and does not have run access", async () => {
    await db("runs").insert(buildRun({ i: 2, test_id: "test3Id" }));

    const testFn = async (): Promise<TestResult> =>
      testResolver({}, { id: "testId", run_id: "run2Id" }, testContext);

    await expect(testFn()).rejects.toThrowError("cannot access test");

    await db("runs").where({ id: "run2Id" }).del();
  });

  it("throws an error if no test or run id provided", async () => {
    const testFn = async (): Promise<TestResult> =>
      testResolver({}, {}, testContext);
    await expect(testFn()).rejects.toThrowError("Must provide id or run_id");
  });
});

describe("testSummaryResolver", () => {
  afterEach(jest.restoreAllMocks);

  it("returns a list of the last runs with gif", async () => {
    jest.spyOn(runModel, "findLatestRuns").mockResolvedValue([
      { completed_at: minutesFromNow(), gif_url: "url", id: "runId" },
      { gif_url: null, id: "run2Id" },
    ] as SuiteRun[]);

    const summary = await testSummaryResolver(
      {
        group_id: "groupId",
        id: "testId",
      } as Test & { group_id: string },
      {},
      { logger } as Context
    );

    expect(summary).toMatchObject({
      gif_url: "url",
      last_runs: [{ id: "runId" }, { id: "run2Id" }],
    });
  });

  it("does not include gif if last run not completed", async () => {
    jest
      .spyOn(runModel, "findLatestRuns")
      .mockResolvedValue([
        { gif_url: null, id: "runId" },
        { id: "run2Id" },
      ] as SuiteRun[]);

    const summary = await testSummaryResolver(
      {
        group_id: "groupId",
        id: "testId",
      } as Test & { group_id: string },
      {},
      { logger } as Context
    );

    expect(summary).toMatchObject({
      gif_url: null,
      last_runs: [{ id: "runId" }, { id: "run2Id" }],
    });
  });
});

describe("testsResolver", () => {
  it("finds tests for a group", async () => {
    const tests = await testsResolver({ group_id: "groupId" }, {}, testContext);

    expect(tests).toMatchObject([{ creator_id: "userId", id: "testId" }]);
  });
});

describe("updateTestResolver", () => {
  it("updates a test", async () => {
    const test = await updateTestResolver(
      {},
      {
        code: "newCode",
        id: "testId",
        is_enabled: true,
        version: 13,
      },
      testContext
    );

    expect(test).toMatchObject({
      code: "newCode",
      id: "testId",
      is_enabled: true,
      version: 13,
    });
  });
});
