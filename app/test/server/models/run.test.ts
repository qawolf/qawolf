import { db, dropTestDb, migrateDb } from "../../../server/db";
import { encrypt } from "../../../server/models/encrypt";
import {
  countPendingRuns,
  createRunsForTests,
  findLatestRuns,
  findPendingRun,
  findRun,
  findRunsForSuite,
  findSuiteRunForRunner,
  updateRun,
} from "../../../server/models/run";
import * as alertService from "../../../server/services/alert/send";
import * as storageService from "../../../server/services/aws/storage";
import { Run } from "../../../server/types";
import { minutesFromNow } from "../../../server/utils";
import {
  buildArtifacts,
  buildEnvironmentVariable,
  buildGroup,
  buildRun,
  buildRunner,
  buildSuite,
  buildTeam,
  buildTest,
  buildUser,
  logger,
} from "../utils";

const artifacts = buildArtifacts();
const test = buildTest({});
const test2 = buildTest({ i: 2, name: "testName" });

describe("run model", () => {
  beforeAll(async () => {
    await migrateDb();

    await db("runners").insert(buildRunner({}));

    await db("users").insert(buildUser({}));
    await db("teams").insert([
      buildTeam({}),
      buildTeam({ i: 2 }),
      buildTeam({ i: 3 }),
      buildTeam({ i: 4 }),
    ]);
    await db("groups").insert([
      buildGroup({}),
      buildGroup({ i: 2, is_default: true, team_id: "team3Id" }),
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

    await db("group_tests").insert([
      {
        group_id: "groupId",
        id: "groupTestId",
        test_id: "test2Id",
      },
      {
        group_id: "groupId",
        id: "groupTest2Id",
        test_id: "test4Id",
      },
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

  afterAll(() => {
    jest.restoreAllMocks();
    return dropTestDb();
  });

  describe("countPendingRuns", () => {
    it("counts the unassigned runs that have not started", async () => {
      const result = await countPendingRuns({ logger });
      expect(result).toEqual(4);
    });
  });

  describe("createRunsForTests", () => {
    it("creates runs for a suite", async () => {
      const runs = await createRunsForTests(
        {
          suite_id: "suiteId",
          tests: [test, test2],
        },
        { logger }
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
    it("returns the latest runs for a test and group", async () => {
      const runs = await findLatestRuns(
        {
          group_id: "groupId",
          test_id: "test2Id",
        },
        { logger }
      );

      expect(runs).toMatchObject([
        { id: "run3Id" },
        { id: "run4Id" },
        { id: "run7Id" },
      ]);
    });
  });

  describe("findRun", () => {
    it("finds a run", async () => {
      const run = await findRun("runId", { logger });

      expect(run).toMatchObject({
        id: "runId",
        suite_id: null,
        test_id: "testId",
      });
    });

    it("finds a run if transaction passed", async () => {
      const run = await findRun("runId", { logger });

      expect(run).toMatchObject({
        id: "runId",
        suite_id: null,
        test_id: "testId",
      });
    });

    it("throws an error if run does not exist", async () => {
      const testFn = async (): Promise<Run> => {
        return findRun("fakeId", { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");
    });
  });

  describe("findPendingRun", () => {
    it("finds the oldest uncompleted run", async () => {
      const pending = await findPendingRun({}, { logger });
      expect(pending).toMatchObject({
        created_at: expect.any(Date),
        id: "run5Id",
      });
    });

    it("finds a run that needs a runner", async () => {
      const pending = await findPendingRun({ needs_runner: true }, { logger });
      expect(pending).toMatchObject({
        created_at: expect.any(Date),
        id: "runId",
      });
    });
  });

  describe("findRunsForSuite", () => {
    beforeAll(async () => {
      return db("tests")
        .update({ deleted_at: minutesFromNow() })
        .where({ id: "test3Id" });
    });

    afterAll(async () => {
      return db("tests").update({ deleted_at: null }).where({ id: "test3Id" });
    });

    it("finds runs for a suite", async () => {
      const runs = await findRunsForSuite("suite2Id", { logger });

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
          test_name: "testName2",
        },
      ]);
    });
  });

  describe("findSuiteRunForRunner", () => {
    beforeAll(() => {
      return db("environment_variables").insert(
        buildEnvironmentVariable({ group_id: "group2Id", team_id: "team3Id" })
      );
    });

    afterAll(() => {
      return db("environment_variables").del();
    });

    it("returns a run and associated test version", async () => {
      await db("suites").update({
        environment_variables: encrypt(
          JSON.stringify({ SUITE_VARIABLE: "suite_value" })
        ),
      });

      jest
        .spyOn(storageService, "getArtifactsOptions")
        .mockResolvedValue(artifacts);

      const run = await findSuiteRunForRunner("run6Id", { logger });

      expect(run).toEqual({
        artifacts,
        code: 'const x = "hello"',
        env: JSON.stringify({
          ENV_VARIABLE: "secret",
          SUITE_VARIABLE: "suite_value",
        }),
        id: "run6Id",
        test_id: "test4Id",
        version: 11,
      });

      await db("suites").update({ environment_variables: null });
    });

    it("does not include suite variables if none specified", async () => {
      jest
        .spyOn(storageService, "getArtifactsOptions")
        .mockResolvedValue(artifacts);

      const run = await findSuiteRunForRunner("run6Id", { logger });

      expect(run).toEqual({
        artifacts,
        code: 'const x = "hello"',
        env: JSON.stringify({
          ENV_VARIABLE: "secret",
        }),
        id: "run6Id",
        test_id: "test4Id",
        version: 11,
      });
    });

    it("returns null if run is not found", async () => {
      const run = await findSuiteRunForRunner("fakeId", { logger });

      expect(run).toBeNull();
    });

    it("returns null if run does not have a suite", async () => {
      const run = await findSuiteRunForRunner("run8Id", { logger });

      expect(run).toBeNull();
    });
  });

  describe("updateRun", () => {
    it("updates existing run", async () => {
      await updateRun(
        {
          code: "code",
          current_line: 11,
          id: "runId",
          status: "pass",
        },
        { logger }
      );

      const run2 = await findRun("runId", { logger });
      expect(run2).toMatchObject({
        code: "code",
        current_line: 11,
        completed_at: expect.any(Date),
        id: "runId",
        status: "pass",
      });
    });

    it("calls sendAlert when a suite run completes", async () => {
      jest.spyOn(alertService, "sendAlert").mockResolvedValue();

      await updateRun(
        {
          id: "run5Id",
          status: "pass",
        },
        { logger }
      );

      expect(alertService.sendAlert).toBeCalledWith({
        logger,
        suite_id: "suite2Id",
      });
    });

    it("throws an error if run does not exist", async () => {
      const testFn = async (): Promise<Run> => {
        return updateRun(
          {
            id: "fakeId",
            status: "pass",
          },
          { logger }
        );
      };

      await expect(testFn()).rejects.toThrowError("not found");
    });
  });
});
