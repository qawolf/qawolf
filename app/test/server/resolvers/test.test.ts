import * as runModel from "../../../server/models/run";
import * as testModel from "../../../server/models/test";
import * as testResolvers from "../../../server/resolvers/test";
import * as azure from "../../../server/services/aws/storage";
import { RunWithGif } from "../../../server/types";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildGroup,
  buildRun,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
  testContext,
} from "../utils";

const {
  createTestResolver,
  deleteTestsResolver,
  testResolver,
  testSummariesResolver,
  testsResolver,
  updateTestResolver,
  updateTestsGroupResolver,
} = testResolvers;

const run = buildRun({ code: "run code" });

const db = prepareTestDb();
const context = { ...testContext, db };
const options = { db, logger };

beforeAll(async () => {
  return db.transaction(async (trx) => {
    await trx("users").insert([buildUser({}), buildUser({ i: 2 })]);
    await trx("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
    await trx("team_users").insert([
      buildTeamUser({}),
      buildTeamUser({ i: 2, team_id: "team2Id", user_id: "user2Id" }),
    ]);

    await trx("groups").insert(buildGroup({}));

    await trx("triggers").insert([
      buildTrigger({}),
      buildTrigger({ i: 2, team_id: "team2Id" }),
      buildTrigger({ i: 3 }),
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

describe("createTestResolver", () => {
  afterAll(jest.clearAllMocks);

  it("creates a test", async () => {
    const test = await createTestResolver(
      {},
      {
        group_id: "groupId",
        guide: null,
        team_id: "teamId",
        url: "https://google.com",
      },
      context
    );

    expect(test).toMatchObject({
      team_id: "teamId",
      creator_id: "userId",
      group_id: "groupId",
      guide: null,
      id: expect.any(String),
      name: "My Test",
    });

    await db("tests").where({ id: test.id }).del();
  });

  it("creates a test for a guide", async () => {
    const test = await createTestResolver(
      {},
      {
        group_id: "groupId",
        guide: "Create a Test",
        team_id: "teamId",
        url: "https://google.com",
      },
      context
    );

    expect(test).toMatchObject({
      guide: "Create a Test",
      name: "Guide: Create a Test",
    });

    await db("tests").where({ id: test.id }).del();
  });
});

describe("deleteTestsResolver", () => {
  it("deletes a test", async () => {
    const tests = await deleteTestsResolver(
      {},
      { ids: ["deleteMe"] },
      {
        ...context,
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

    const test = await testModel.findTest("deleteMe", options);
    expect(test.deleted_at).not.toBeNull();

    const testTrigger = await db
      .select("*")
      .from("test_triggers")
      .where("test_id", "deleteMe")
      .first();
    expect(testTrigger).toBeFalsy();
  });
});

describe("testResolver", () => {
  it("finds a test by id", async () => {
    const result = await testResolver({}, { id: "testId" }, context);
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

    const result = await testResolver({}, { run_id: "runId" }, context);

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
    await expect(
      testResolver(
        {},
        { id: "testId" },
        { api_key: null, db, ip: null, logger, teams: null, user: null }
      )
    ).rejects.toThrowError("no teams");
  });

  it("throws an error if user passes both test id and run id and does not have run access", async () => {
    await db("runs").insert(buildRun({ i: 2, test_id: "test3Id" }));

    await expect(
      testResolver({}, { id: "testId", run_id: "run2Id" }, context)
    ).rejects.toThrowError("cannot access test");

    await db("runs").where({ id: "run2Id" }).del();
  });

  it("throws an error if no test or run id provided", async () => {
    await expect(testResolver({}, {}, context)).rejects.toThrowError(
      "Must provide id or run_id"
    );
  });
});

describe("testSummariesResolver", () => {
  afterEach(jest.restoreAllMocks);

  it("returns a list of the last runs with gif", async () => {
    jest.spyOn(runModel, "findLatestRuns").mockResolvedValue([
      { completed_at: minutesFromNow(), gif_url: "url", id: "runId" },
      { gif_url: null, id: "run2Id" },
    ] as RunWithGif[]);

    const summaries = await testSummariesResolver(
      {},
      {
        test_ids: ["testId"],
        trigger_id: "triggerId",
      },
      { ...testContext, db }
    );

    expect(summaries).toMatchObject([
      {
        gif_url: "url",
        last_runs: [{ id: "runId" }, { id: "run2Id" }],
        test_id: "testId",
      },
    ]);
  });

  it("does not include gif if last run not completed", async () => {
    jest
      .spyOn(runModel, "findLatestRuns")
      .mockResolvedValue([
        { gif_url: null, id: "runId" },
        { id: "run2Id" },
      ] as RunWithGif[]);

    const summary = await testSummariesResolver(
      {},
      {
        test_ids: ["testId"],
        trigger_id: "triggerId",
      },
      { ...testContext, db }
    );

    expect(summary).toMatchObject([
      {
        gif_url: null,
        last_runs: [{ id: "runId" }, { id: "run2Id" }],
      },
    ]);
  });
});

describe("testsResolver", () => {
  it("finds tests for a team", async () => {
    const tests = await testsResolver({}, { team_id: "teamId" }, context);

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
      context
    );

    expect(test).toMatchObject({
      code: "newCode",
      id: "testId",
      is_enabled: true,
      version: 13,
    });
  });
});

describe("updateTestsGroupResolver", () => {
  it("updates the group for tests", async () => {
    const tests = await updateTestsGroupResolver(
      {},
      { group_id: "groupId", test_ids: ["testId"] },
      context
    );

    expect(tests).toMatchObject([{ group_id: "groupId", id: "testId" }]);
  });
});
