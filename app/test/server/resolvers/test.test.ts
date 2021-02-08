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
  buildRun,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const {
  createTestResolver,
  deleteTestsResolver,
  findTeamAndTriggerIdsForCreateTest,
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

    await trx("triggers").insert([
      buildTrigger({}),
      buildTrigger({ i: 2, team_id: "team2Id" }),
      buildTrigger({ i: 3, is_default: true, name: "All Tests" }),
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

    await trx("test_triggers").insert([
      {
        id: "testTriggerId",
        test_id: "testId",
        trigger_id: "triggerId",
      },
      {
        id: "testTrigger2Id",
        test_id: "deleteMe",
        trigger_id: "triggerId",
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
      { trigger_id: "triggerId", url: "https://google.com" },
      testContext
    );

    expect(test).toMatchObject({
      team_id: "teamId",
      creator_id: "userId",
      id: expect.any(String),
      name: "My Test 2",
    });

    await db("test_triggers").where({ test_id: test.id }).del();
    await db("tests").where({ id: test.id }).del();
  });

  it("throws an error if testing qawolf.com", async () => {
    const testFn = async (): Promise<Test> => {
      return createTestResolver(
        {},
        { trigger_id: "triggerId", url: "https://qawolf.com" },
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

    const testTrigger = await db
      .select("*")
      .from("test_triggers")
      .where("test_id", "deleteMe")
      .first();
    expect(testTrigger).toBeFalsy();
  });
});

describe("findTeamAndTriggerIdsForCreateTest", () => {
  it("returns trigger id and default trigger id if applicable", async () => {
    const result = await findTeamAndTriggerIdsForCreateTest({
      logger,
      teams: testContext.teams,
      trigger_id: "triggerId",
    });

    result.triggerIds.sort();

    expect(result).toMatchObject({
      team: testContext.teams[0],
      triggerIds: ["trigger3Id", "triggerId"],
    });
  });

  it("returns trigger id if default trigger provided", async () => {
    const result = await findTeamAndTriggerIdsForCreateTest({
      logger,

      teams: testContext.teams,
      trigger_id: "trigger3Id",
    });

    expect(result).toMatchObject({
      team: testContext.teams[0],
      triggerIds: ["trigger3Id"],
    });
  });

  it("returns default trigger otherwise", async () => {
    const result = await findTeamAndTriggerIdsForCreateTest({
      logger,
      teams: testContext.teams,
      trigger_id: null,
    });

    expect(result).toMatchObject({
      team: testContext.teams[0],
      triggerIds: ["trigger3Id"],
    });
  });

  it("throws an error if user on multiple teams and no trigger provided", async () => {
    const testFn = async (): Promise<{
      team: Team;
      triggerIds: string[];
    }> => {
      return findTeamAndTriggerIdsForCreateTest({
        logger,
        teams: [...testContext.teams, buildTeam({ i: 2 })],
        trigger_id: null,
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
        id: "testId",
        trigger_id: "triggerId",
      } as Test & { trigger_id: string },
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
        id: "testId",
        trigger_id: "triggerId",
      } as Test & { trigger_id: string },
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
  it("finds tests for a trigger", async () => {
    const tests = await testsResolver(
      { trigger_id: "triggerId" },
      {},
      testContext
    );

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
