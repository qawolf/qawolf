/* eslint-disable @typescript-eslint/no-explicit-any */
import * as runModel from "../../../../server/models/run";
import * as testModel from "../../../../server/models/test";
import * as testResolvers from "../../../../server/resolvers/test";
import * as helpers from "../../../../server/resolvers/test/helpers";
import * as azure from "../../../../server/services/aws/storage";
import * as gitHubFile from "../../../../server/services/gitHub/file";
import * as gitHubTree from "../../../../server/services/gitHub/tree";
import { RunWithGif } from "../../../../server/types";
import { minutesFromNow } from "../../../../shared/utils";
import { prepareTestDb } from "../../db";
import {
  buildGroup,
  buildIntegration,
  buildRun,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
  testContext,
} from "../../utils";

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
  await db("users").insert([buildUser({}), buildUser({ i: 2 })]);
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
  await db("team_users").insert([
    buildTeamUser({}),
    buildTeamUser({ i: 2, team_id: "team2Id", user_id: "user2Id" }),
  ]);

  await db("groups").insert(buildGroup({}));
  await db("integrations").insert(buildIntegration({ type: "github_sync" }));

  await db("triggers").insert([
    buildTrigger({}),
    buildTrigger({ i: 2, team_id: "team2Id" }),
    buildTrigger({ i: 3 }),
  ]);

  await db("tests").insert([
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

  await db("test_triggers").insert([
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

  return db("runs").insert(run);
});

describe("createTestResolver", () => {
  afterEach(jest.clearAllMocks);

  it("creates a test", async () => {
    jest.spyOn(gitHubFile, "createFileForTest");

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
      url: "https://google.com",
    });

    expect(gitHubFile.createFileForTest).not.toBeCalled();

    await db("tests").where({ id: test.id }).del();
  });

  it("creates a test for a git branch", async () => {
    const spy = jest.spyOn(gitHubFile, "createFileForTest").mockResolvedValue();

    const test = await createTestResolver(
      {},
      {
        branch: "main",
        group_id: null,
        guide: null,
        team_id: "teamId",
        url: "https://google.com",
      },
      {
        ...context,
        teams: [
          { ...context.teams[0], git_sync_integration_id: "integrationId" },
        ],
      }
    );

    expect(test).toMatchObject({
      team_id: "teamId",
      creator_id: "userId",
      group_id: null,
      guide: null,
      id: expect.any(String),
      name: "My Test",
      url: "https://google.com",
    });

    expect(gitHubFile.createFileForTest).toBeCalledTimes(1);
    expect(spy.mock.calls[0][0]).toMatchObject({
      branch: "main",
      integrationId: "integrationId",
      test: { id: test.id },
    });

    await db("tests").where({ id: test.id }).del();
  });

  it("creates a test for a guide", async () => {
    jest.spyOn(gitHubFile, "createFileForTest");

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

    expect(gitHubFile.createFileForTest).not.toBeCalled();

    await db("tests").where({ id: test.id }).del();
  });
});

describe("deleteTestsResolver", () => {
  it("deletes a test", async () => {
    jest.spyOn(helpers, "deleteGitHubTests");

    const tests = await deleteTestsResolver(
      {},
      { branch: null, ids: ["deleteMe"] },
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
    expect(test.deleted_at).toBeTruthy();

    const testTrigger = await db
      .select("*")
      .from("test_triggers")
      .where("test_id", "deleteMe")
      .first();
    expect(testTrigger).toBeFalsy();

    expect(helpers.deleteGitHubTests).not.toBeCalled();

    await db("tests").where({ id: "deleteMe" }).update({ deleted_at: null });
  });

  it("deletes a test on a git branch", async () => {
    const spy = jest.spyOn(helpers, "deleteGitHubTests").mockResolvedValue();

    const tests = await deleteTestsResolver(
      {},
      { branch: "main", ids: ["deleteMe"] },
      {
        ...context,
        teams: [buildTeam({ i: 2 })],
        user: buildUser({ i: 2 }),
      }
    );

    expect(tests).toMatchObject([{ id: "deleteMe" }]);

    expect(helpers.deleteGitHubTests).toBeCalledTimes(1);
    expect(spy.mock.calls[0][0]).toMatchObject({
      branch: "main",
      tests: [{ id: "deleteMe" }],
      teams: [{ id: "team2Id" }],
    });

    const dbTest = await db("tests").where({ id: "deleteMe" }).first();

    expect(dbTest.deleted_at).toBeNull();
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
  it("finds tests for a team when branch not specified", async () => {
    const tests = await testsResolver(
      {},
      { branch: null, team_id: "teamId" },
      context
    );

    expect(tests).toMatchObject([{ creator_id: "userId", id: "testId" }]);
  });

  it("finds tests for a team when branch specified", async () => {
    jest.spyOn(gitHubTree, "findTestsForBranch").mockResolvedValue({
      tests: [{ path: "test.test.js" }, { path: "anotherTest.test.js" }],
    } as any);

    const tests = await testsResolver(
      {},
      { branch: "main", team_id: "teamId" },
      {
        ...context,
        teams: [
          { ...context.teams[0], git_sync_integration_id: "integrationId" },
        ],
      }
    );

    expect(tests).toMatchObject([
      { creator_id: null, name: "anotherTest" },
      { name: "test" },
    ]);

    await db("tests").where({ name: "anotherTest" }).del();
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
