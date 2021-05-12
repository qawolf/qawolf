import { encrypt } from "../../../server/models/encrypt";
import {
  countIncompleteRuns,
  countRunsForTeam,
  createRunsForTests,
  findLatestRuns,
  findPendingRun,
  findRun,
  findRunsForSuite,
  findStatusCountsForSuite,
  findSuiteRunForRunner,
  findTestHistory,
  updateRun,
} from "../../../server/models/run";
import * as storageService from "../../../server/services/aws/storage";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildArtifacts,
  buildEnvironment,
  buildEnvironmentVariable,
  buildRun,
  buildRunner,
  buildSuite,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const artifacts = buildArtifacts();
const test = buildTest({});
const test2 = buildTest({ i: 2, name: "testName" });

const db = prepareTestDb();
const options = { db, logger };

describe("run model", () => {
  beforeAll(async () => {
    await db("runners").insert(buildRunner({}));

    await db("users").insert(buildUser({}));
    await db("teams").insert([
      buildTeam({}),
      buildTeam({ i: 2 }),
      buildTeam({
        apiKey: "qawolf_testapikey",
        inbox: "test@dev.qawolf.email",
        i: 3,
      }),
      buildTeam({ i: 4 }),
    ]);
    await db("triggers").insert([
      buildTrigger({}),
      buildTrigger({ i: 2, team_id: "team3Id" }),
    ]);

    await db("suites").insert([
      buildSuite({ team_id: "team2Id" }),
      buildSuite({ team_id: "team2Id", i: 2 }),
      buildSuite({ team_id: "team3Id", i: 3 }),
      buildSuite({ team_id: "team3Id", i: 4 }),
    ]);

    await db("tests").insert([
      test,
      test2,
      buildTest({ i: 3, name: "testName2" }),
      buildTest({ i: 4 }),
    ]);

    await db("runs").insert([
      buildRun({}),
      buildRun({ i: 2, test_id: "test2Id" }),
      buildRun({
        i: 3,
        completed_at: new Date("2020-09-22T20:31:45.000Z").toISOString(),
        started_at: new Date("2020-09-22T20:30:00.000Z").toISOString(),
        suite_id: "suiteId",
        test_id: "test2Id",
      }),
      buildRun({
        completed_at: new Date("2020-09-22T20:32:00.000Z").toISOString(),
        i: 4,
        started_at: new Date("2020-09-22T20:30:00.000Z").toISOString(),
        status: "pass",
        suite_id: "suite2Id",
        test_id: "test2Id",
      }),
      buildRun({
        created_at: minutesFromNow(-1),
        i: 5,
        started_at: new Date("2020-09-22T20:30:00.000Z").toISOString(),
        suite_id: "suite2Id",
        test_id: "test3Id",
      }),
      buildRun({ i: 6, suite_id: "suite3Id", test_id: "test4Id" }),
      buildRun({
        i: 7,
        suite_id: "suite4Id",
        test_id: "test2Id",
      }),
    ]);
  });

  afterAll(() => jest.restoreAllMocks());

  describe("countRunsForTeam", () => {
    beforeAll(async () => {
      await db("tests").insert(buildTest({ i: 10, team_id: "team2Id" }));
      await db("suites").insert(buildSuite({ i: 10 }));

      return db("runs").insert(
        buildRun({ i: 10, suite_id: "suite10Id", test_id: "test10Id" })
      );
    });

    afterAll(async () => {
      await db("runs").where({ id: "run10Id" }).del();
      await db("suites").where({ id: "suite10Id" }).del();

      return db("tests").where({ id: "team10Id" }).del();
    });

    it("counts runs for a team", async () => {
      const team = await db("teams").where({ id: "teamId" }).first();

      const result = await countRunsForTeam(team, options);

      expect(result).toBe(6);
    });
  });

  describe("countIncompleteRuns", () => {
    it("counts the runs that have not completed", async () => {
      const result = await countIncompleteRuns(options);
      expect(result).toEqual(5);
    });
  });

  describe("createRunsForTests", () => {
    it("creates runs for a suite", async () => {
      const runs = await createRunsForTests(
        {
          suite_id: "suiteId",
          tests: [test, test2],
        },
        options
      );

      expect(runs).toMatchObject([
        {
          code: test.code,
          status: "created",
          suite_id: "suiteId",
          test_id: test.id,
        },
        {
          code: test2.code,
          status: "created",
          suite_id: "suiteId",
          test_id: test2.id,
        },
      ]);
      expect(runs[0].suite_id).toBe(runs[1].suite_id);

      await db("runs")
        .whereIn(
          "id",
          runs.map((r) => r.id)
        )
        .del();
    });
  });

  describe("findLatestRuns", () => {
    beforeAll(async () => {
      await db("suites").insert(
        buildSuite({ i: 10, trigger_id: "trigger2Id" })
      );
      return db("runs").insert(
        buildRun({ i: 10, suite_id: "suite10Id", test_id: "test2Id" })
      );
    });

    afterAll(async () => {
      await db("runs").where({ id: "run10Id" }).del();
      return db("suites").where({ id: "suite10Id" }).del();
    });

    it("returns the latest runs for a test", async () => {
      const runs = await findLatestRuns("test2Id", options);

      expect(runs).toMatchObject([
        { id: "run10Id" },
        { id: "run3Id" },
        { id: "run4Id" },
        { id: "run7Id" },
      ]);
    });
  });

  describe("findRun", () => {
    it("finds a run", async () => {
      const run = await findRun("runId", options);

      expect(run).toMatchObject({
        id: "runId",
        suite_id: null,
        test_id: "testId",
      });
    });

    it("finds a run if transaction passed", async () => {
      const run = await findRun("runId", options);

      expect(run).toMatchObject({
        id: "runId",
        suite_id: null,
        test_id: "testId",
      });
    });

    it("returns null if run does not exist", async () => {
      expect(await findRun("fakeId", options)).toEqual(null);
    });
  });

  describe("findPendingRun", () => {
    it("finds the oldest uncompleted run", async () => {
      const pending = await findPendingRun({}, options);
      expect(pending).toMatchObject({
        created_at: expect.any(Date),
        id: "run5Id",
      });
    });

    it("finds a run that needs a runner", async () => {
      const pending = await findPendingRun({ needs_runner: true }, options);
      expect(pending).toMatchObject({
        created_at: expect.any(Date),
        id: "runId",
      });
    });
  });

  describe("findRunsForSuite", () => {
    beforeAll(async () => {
      return db("tests")
        .update({
          deleted_at: minutesFromNow(),
          name: null,
          path: "myTest.test.js",
        })
        .where({ id: "test3Id" });
    });

    afterAll(async () => {
      return db("tests")
        .update({ deleted_at: null, name: "test2", path: null })
        .where({ id: "test3Id" });
    });

    it("finds runs for a suite", async () => {
      const runs = await findRunsForSuite("suite2Id", options);

      expect(runs).toMatchObject([
        {
          gif_url: expect.any(String),
          id: "run4Id",
          is_test_deleted: false,
          suite_id: "suite2Id",
          test_id: "test2Id",
          test_name: "testName",
        },
        {
          gif_url: null,
          id: "run5Id",
          is_test_deleted: true,
          suite_id: "suite2Id",
          test_id: "test3Id",
          test_name: "myTest.test.js",
        },
      ]);
    });
  });

  describe("findStatusCountsForSuite", () => {
    it("returns status counts for a suite", async () => {
      const counts = await findStatusCountsForSuite("suiteId", options);

      expect(counts).toEqual({
        created: 1,
        fail: 0,
        pass: 0,
      });

      const counts2 = await findStatusCountsForSuite("suite2Id", options);

      expect(counts2).toEqual({
        created: 1,
        fail: 0,
        pass: 1,
      });
    });
  });

  describe("findSuiteRunForRunner", () => {
    beforeAll(async () => {
      await db("suites").update({ helpers: "helpers" });

      await db("environments").insert(buildEnvironment({ team_id: "team3Id" }));

      return db("environment_variables").insert(
        buildEnvironmentVariable({
          environment_id: "environmentId",
          team_id: "team3Id",
        })
      );
    });

    afterAll(async () => {
      await db("suites").update({ helpers: "" });

      await db("environment_variables").del();
      return db("environments").del();
    });

    it("returns a run", async () => {
      await db("suites").update({
        environment_id: "environmentId",
        environment_variables: encrypt(
          JSON.stringify({ SUITE_VARIABLE: "suite_value" })
        ),
      });

      jest
        .spyOn(storageService, "getArtifactsOptions")
        .mockResolvedValue(artifacts);

      const run = await findSuiteRunForRunner("run6Id", options);

      expect(run).toEqual({
        artifacts,
        code: 'const x = "hello"',
        env: JSON.stringify({
          ENV_VARIABLE: "secret",
          SUITE_VARIABLE: "suite_value",
          QAWOLF_TEAM_API_KEY: "qawolf_testapikey",
          QAWOLF_TEAM_INBOX: "test@dev.qawolf.email",
        }),
        helpers: "helpers",
        id: "run6Id",
        test_id: "test4Id",
      });

      await db("suites").update({
        environment_id: null,
        environment_variables: null,
      });
    });

    it("does not include suite variables if none specified", async () => {
      await db("suites").update({ environment_id: "environmentId" });

      jest
        .spyOn(storageService, "getArtifactsOptions")
        .mockResolvedValue(artifacts);

      const run = await findSuiteRunForRunner("run6Id", options);

      expect(run).toEqual({
        artifacts,
        code: 'const x = "hello"',
        env: JSON.stringify({
          ENV_VARIABLE: "secret",
          QAWOLF_TEAM_API_KEY: "qawolf_testapikey",
          QAWOLF_TEAM_INBOX: "test@dev.qawolf.email",
        }),
        helpers: "helpers",
        id: "run6Id",
        test_id: "test4Id",
      });

      await db("suites").update({ environment_id: null });
    });

    it("does not include environment variables if none specified", async () => {
      jest
        .spyOn(storageService, "getArtifactsOptions")
        .mockResolvedValue(artifacts);

      const run = await findSuiteRunForRunner("run6Id", options);

      expect(run).toEqual({
        artifacts,
        code: 'const x = "hello"',
        env: JSON.stringify({
          QAWOLF_TEAM_API_KEY: "qawolf_testapikey",
          QAWOLF_TEAM_INBOX: "test@dev.qawolf.email",
        }),
        helpers: "helpers",
        id: "run6Id",
        test_id: "test4Id",
      });
    });

    it("returns null if run is not found", async () => {
      const run = await findSuiteRunForRunner("fakeId", options);

      expect(run).toBeNull();
    });

    it("returns null if run does not have a suite", async () => {
      const run = await findSuiteRunForRunner("run8Id", options);

      expect(run).toBeNull();
    });
  });

  describe("findTestHistory", () => {
    it("returns the latest runs for a test and trigger", async () => {
      const runs = await findTestHistory("test2Id", options);

      expect(runs).toMatchObject([
        { id: "run2Id" },
        { id: "run3Id" },
        { id: "run4Id" },
        { id: "run7Id" },
      ]);
    });
  });

  describe("updateRun", () => {
    afterEach(async () => {
      await db("jobs").del();
      return db("runs").update(buildRun({})).where({ id: "runId" });
    });

    it("creates associated job when a suite run completes", async () => {
      await updateRun(
        {
          id: "run5Id",
          status: "pass",
        },
        options
      );

      const jobs = await db("jobs").orderBy("name", "asc");

      expect(jobs).toMatchObject([
        { name: "alert", suite_id: "suite2Id" },
        { name: "github_commit_status", suite_id: "suite2Id" },
        { name: "pull_request_comment", suite_id: "suite2Id" },
      ]);
    });

    it("retries an error", async () => {
      await updateRun({ id: "runId", retry_error: "retry me" }, options);

      const updated = await findRun("runId", options);
      expect(updated).toMatchObject({
        completed_at: null,
        error: "retry me",
        retries: 1,
        started_at: null,
        status: "created",
      });
    });

    it("throws an error if run does not exist", async () => {
      await expect(
        updateRun(
          {
            id: "fakeId",
            status: "pass",
          },
          options
        )
      ).rejects.toThrowError("not found");
    });

    it("updates a run", async () => {
      const run = await findRun("runId", options);
      expect(run).toMatchObject({ completed_at: null, started_at: null });

      await updateRun(
        {
          code: "code",
          current_line: 11,
          id: "runId",
          status: "pass",
        },
        options
      );

      const updated = await findRun("runId", options);
      // it should set completed_at and started_at
      expect(updated).toMatchObject({
        code: "code",
        current_line: 11,
        completed_at: expect.any(Date),
        id: "runId",
        started_at: expect.any(Date),
        status: "pass",
      });
    });

    it("updates the first 100 characters of an error", async () => {
      await updateRun(
        {
          error: "error".repeat(100),
          id: "runId",
          status: "fail",
        },
        options
      );

      const updated = await findRun("runId", options);
      expect(updated.error).toHaveLength(100);
    });
  });
});
