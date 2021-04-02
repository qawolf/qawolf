import * as runModel from "../../../server/models/run";
import { findRun } from "../../../server/models/run";
import {
  assignRunner,
  countExcessRunners,
  createRunners,
  deleteUnhealthyRunners,
  findPendingTestOrRunId,
  findRunner,
  findRunners,
  requestRunnerForTest,
  resetRunner,
  updateRunner,
} from "../../../server/models/runner";
import * as runnerModel from "../../../server/models/runner";
import * as testModel from "../../../server/models/test";
import { findTest, updateTestToPending } from "../../../server/models/test";
import * as locationService from "../../../server/services/location";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildEnvironmentVariable,
  buildRun,
  buildRunner,
  buildTeam,
  buildTest,
  buildUser,
  logger,
} from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("teams").insert(buildTeam({}));
  await db("users").insert(buildUser({}));
  await db("tests").insert(buildTest({}));
  await db("runs").insert(buildRun({ started_at: minutesFromNow() }));
});

describe("assignRunner", () => {
  const runner = buildRunner({ api_key: "apiKey", ready_at: minutesFromNow() });

  beforeAll(() => db("runners").insert(runner));

  afterEach(() =>
    db("runners")
      .update({
        ready_at: minutesFromNow(),
        run_id: null,
        session_expires_at: null,
        test_id: null,
      })
      .where({ id: "runnerId" })
  );

  afterAll(() => db("runners").del());

  it("assigns a run to the runner", async () => {
    await assignRunner({ runner, run_id: "runId" }, options);

    const result = await findRunner({ id: "runnerId" }, options);
    expect(result).toMatchObject({ id: "runnerId", run_id: "runId" });

    expect(result.session_expires_at).toBeTruthy();
  });

  it("assigns a test to the runner", async () => {
    await updateTestToPending(
      { id: "testId", runner_locations: ["westus2"] },
      options
    );
    await assignRunner({ runner, test_id: "testId" }, options);

    const result = await findRunner({ id: "runnerId" }, options);
    expect(result).toMatchObject({ id: "runnerId", test_id: "testId" });
    expect(result.session_expires_at).toBeTruthy();

    // check it clears test.runner_request_at when it is assigned
    const test = await findTest("testId", options);
    expect(test).toMatchObject({ runner_requested_at: null });
  });
});

describe("countExcessRunners", () => {
  const runners = [
    buildRunner({ api_key: "apiKey", ready_at: minutesFromNow() }),
    buildRunner({ api_key: "apiKey", i: 2, ready_at: minutesFromNow() }),
  ];

  beforeAll(async () => {
    await db("runners").insert(runners);

    return db("environment_variables").insert({
      ...buildEnvironmentVariable({ name: "RUNNER_LOCATIONS" }),
      environment_id: null,
      is_system: true,
      team_id: null,
      value: JSON.stringify({
        westus2: { buffer: 2, latitude: 0, longitude: 0, reserved: 1 },
      }),
    });
  });

  afterAll(async () => {
    await db("runners").del();
    return db("environment_variables").del();
  });

  it("subtracts reserved from available runners", async () => {
    const count = await countExcessRunners("westus2", options);
    expect(count).toEqual(1);
  });
});

describe("createRunners", () => {
  afterAll(() => db("runners").del());

  it("creates a runner per location", async () => {
    const locations = ["eastus2", "westus2"];

    const runners = await createRunners(locations, options);

    const createdRunners = await db("runners").whereIn(
      "id",
      runners.map((r) => r.id)
    );

    expect(createdRunners.map((r) => r.location)).toEqual(locations);
  });
});

describe("deleteUnhealthyRunners", () => {
  beforeEach(() => db("runners").del());
  afterAll(() => db("runners").del());

  it("does not delete workers that were just created and have not reported a health check", async () => {
    await db("runners").insert(buildRunner({}));
    await deleteUnhealthyRunners(options);
    const { deleted_at } = await db("runners")
      .where({ id: "runnerId" })
      .first();

    expect(deleted_at).toBeNull();
  });

  it("does not delete previously deleted workers", async () => {
    const deleted_at = minutesFromNow(-1);

    await db("runners").insert(
      buildRunner({
        created_at: minutesFromNow(-5),
        deleted_at,
      })
    );

    await deleteUnhealthyRunners(options);

    const runner = await findRunner(
      { id: "runnerId", include_deleted: true },
      options
    );
    expect(runner).toMatchObject({ deleted_at: new Date(deleted_at) });
  });

  it("deletes workers that have not reported a health check and are created 5 minutes ago", async () => {
    await db("runners").insert([
      buildRunner({ created_at: minutesFromNow(-4) }),
      buildRunner({ created_at: minutesFromNow(-5), i: 2 }),
    ]);
    await deleteUnhealthyRunners(options);

    const runner2 = await db("runners").where({ id: "runnerId" }).first();
    expect(runner2?.deleted_at).toBeNull();

    const runner3 = await db("runners").where({ id: "runner2Id" }).first();
    expect(runner3?.deleted_at).not.toBeNull();
  });

  it("deletes workers that have not reported a health check for 2 minutes", async () => {
    await db("runners").insert(
      buildRunner({ health_checked_at: minutesFromNow(-2) })
    );
    await deleteUnhealthyRunners(options);

    const runner4 = await db("runners").where({ id: "runnerId" }).first();
    expect(runner4.deleted_at).not.toBeNull();
  });
});

describe("findRunner", () => {
  beforeAll(async () => {
    await db("runners").insert([
      buildRunner({
        api_key: "apiKey",
        ready_at: minutesFromNow(),
        run_id: "runId",
      }),
      buildRunner({ i: 2, test_id: "testId" }),
    ]);
  });

  afterAll(() => db("runners").del());

  it("finds a runner by id", async () => {
    const runner = await findRunner({ id: "runnerId" }, options);

    expect(runner).toMatchObject({
      id: "runnerId",
    });
  });

  it("finds a ready runner", async () => {
    const runner = await findRunner({ is_ready: true }, options);
    expect(runner.ready_at).not.toBeNull();
  });

  it("finds a runner that matches a location", async () => {
    const runner = await findRunner(
      { locations: ["jamaica", "westus2"] },
      options
    );
    expect(runner).not.toBeNull();
  });

  it("finds a runner by run_id", async () => {
    const result = await findRunner({ run_id: "runId" }, options);
    expect(result.id).toEqual("runnerId");

    // check it prefers the runner for the run if the test id is also specified
    const result2 = await findRunner(
      { run_id: "runId", test_id: "testId" },
      options
    );
    expect(result2.id).toEqual("runnerId");
  });

  it("finds a runner by test_id", async () => {
    const result = await findRunner({ test_id: "testId" }, options);
    expect(result.id).toEqual("runner2Id");

    // check it finds the runner if the run id is also specified
    const result2 = await findRunner(
      { run_id: "fakeRunId", test_id: "testId" },
      options
    );
    expect(result2.id).toEqual("runner2Id");
  });

  it("finds a runner in the closest location possible", async () => {
    await db("runners").insert(buildRunner({ i: 3, location: "eastus1" }));

    const runner = await findRunner(
      { locations: ["eastus1", "westus2"] },
      options
    );
    expect(runner).toMatchObject({ location: "eastus1" });

    const runner2 = await findRunner(
      { locations: ["westus2", "eastus1"] },
      options
    );
    expect(runner2).toMatchObject({ location: "westus2" });

    await db("runners").where({ location: "eastus1" }).del();
  });

  it("includes deleted runners when include_deleted is passed", async () => {
    await db("runners").insert(
      buildRunner({ i: 4, deleted_at: minutesFromNow() })
    );
    const runner = await findRunner({ id: "runner4Id" }, options);
    expect(runner).toBeNull();

    const runner2 = await findRunner(
      { id: "runner4Id", include_deleted: true },
      options
    );
    expect(runner2.id).toEqual("runner4Id");
  });
});

describe("findRunners", () => {
  const runners = [
    buildRunner({}),
    buildRunner({ i: 2 }),
    buildRunner({ i: 3, session_expires_at: minutesFromNow() }),
  ];

  beforeAll(() => db("runners").insert(runners));
  afterAll(() => db("runners").del());

  it("finds expired runners", async () => {
    const found = await findRunners({ is_expired: true }, options);
    expect(found.map((r) => r.id)).toEqual(["runner3Id"]);
  });

  it("finds runners by id", async () => {
    const found = await findRunners(
      { ids: ["runnerId", "runner2Id", "runner3Id"] },
      options
    );

    expect(found.map((r) => r.id)).toEqual(runners.map((r) => r.id));
  });

  it("finds non-deleted runners", async () => {
    await db("runners").insert(
      buildRunner({ deleted_at: minutesFromNow(), i: 4 })
    );

    const found = await findRunners({}, options);
    expect(found.map((r) => r.id)).toEqual(runners.map((r) => r.id));

    await db("runners").where({ id: "runner4Id" }).del();
  });

  it("finds non-deployed runners", async () => {
    await db("runners").insert(
      buildRunner({ deployed_at: minutesFromNow(), i: 5 })
    );

    const found = await findRunners({ deployed_at: null }, options);
    expect(found.map((r) => r.id)).toEqual(runners.map((r) => r.id));
  });
});

describe("findPendingTestOrRunId", () => {
  let countExcessRunnersSpy: jest.SpyInstance;
  let findPendingTestSpy: jest.SpyInstance;

  beforeAll(() => {
    countExcessRunnersSpy = jest.spyOn(runnerModel, "countExcessRunners");
    findPendingTestSpy = jest.spyOn(testModel, "findPendingTest");

    jest
      .spyOn(runModel, "findPendingRun")
      .mockResolvedValue({ id: "pendingRunId" });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("returns a test first", async () => {
    findPendingTestSpy.mockResolvedValue({ id: "pendingTestId" });
    const pending = await findPendingTestOrRunId("eastus2", options);
    expect(pending).toMatchObject({ test_id: "pendingTestId" });
  });

  it("does not return a run if there are no excess runners", async () => {
    findPendingTestSpy.mockResolvedValue(null);
    countExcessRunnersSpy.mockResolvedValue(0);
    const pending = await findPendingTestOrRunId("eastus2", options);
    expect(pending).toEqual(null);
  });

  it("does not return a run if the location is not eastus2", async () => {
    findPendingTestSpy.mockResolvedValue(null);
    countExcessRunnersSpy.mockResolvedValue(1);
    const pending = await findPendingTestOrRunId("westus2", options);
    expect(pending).toEqual(null);
  });

  it("returns a run if there are excess runners", async () => {
    findPendingTestSpy.mockResolvedValue(null);
    countExcessRunnersSpy.mockResolvedValue(1);
    const pending = await findPendingTestOrRunId("eastus2", options);
    expect(pending).toMatchObject({ run_id: "pendingRunId" });
  });
});

describe("requestRunnerForTest", () => {
  const runner = buildRunner({});

  beforeAll(() => {
    jest
      .spyOn(locationService, "rankLocations")
      .mockResolvedValue(["eastus2", "westus2", "centralindia"]);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("assigns a runner if one is available", async () => {
    jest.spyOn(runnerModel, "findRunner").mockResolvedValue(runner);

    const assignRunner = jest
      .spyOn(runnerModel, "assignRunner")
      .mockResolvedValue(runner);

    const result = await requestRunnerForTest(
      { ip: "", test: buildTest({}) },
      options
    );
    expect(result).toEqual(runner);

    expect(assignRunner).toBeCalledWith({ runner, test_id: "testId" }, options);
  });

  it("updates the test to pending if a runner if not available", async () => {
    jest.spyOn(runnerModel, "findRunner").mockResolvedValue(null);

    const assignRunner = jest.spyOn(runnerModel, "assignRunner").mockReset();
    const updateTestToPending = jest.spyOn(testModel, "updateTestToPending");

    const result = await requestRunnerForTest(
      { ip: "", test: buildTest({}) },
      options
    );
    expect(result).toBeNull();

    expect(assignRunner).not.toBeCalled();

    expect(updateTestToPending).toBeCalledWith(
      {
        id: "testId",
        runner_locations: ["eastus2", "westus2", "centralindia"],
      },
      options
    );
  });
});

describe("resetRunner", () => {
  beforeEach(() => db("runners").insert(buildRunner({})));

  afterEach(() => db("runners").del());

  it("unassigns and expires the uncompleted run", async () => {
    await db("runs")
      .update(buildRun({ started_at: minutesFromNow() }))
      .where({ id: "runId" });

    await db("runners").update({ run_id: "runId" });
    await resetRunner({ run_id: "runId", type: "expire" }, options);

    const runner = await db("runners").where({ id: "runnerId" }).first();
    expect(runner).toMatchObject({
      api_key: null,
      ready_at: null,
      run_id: null,
      test_id: null,
    });

    const run = await findRun("runId", options);
    expect(run).toMatchObject({ error: "expired", status: "fail" });
  });

  it("unassigns the test", async () => {
    await db("runners").update({ run_id: null, test_id: "testId" });
    await resetRunner({ id: "runnerId", type: "expire" }, options);

    const runner = await db("runners").where({ id: "runnerId" }).first();
    expect(runner).toMatchObject({
      api_key: null,
      ready_at: null,
      run_id: null,
      test_id: null,
    });
  });

  describe("delete_unassigned", () => {
    it("deletes an unasssigned runner", async () => {
      await resetRunner({ id: "runnerId", type: "delete_unassigned" }, options);

      const runner = await db("runners").where({ id: "runnerId" }).first();
      expect(runner.deleted_at).toBeTruthy();
    });

    it("does not delete a runner if it is assigned", async () => {
      await db("runners")
        .update({ run_id: "runId", test_id: null })
        .where({ id: "runnerId" });

      await resetRunner({ id: "runnerId", type: "delete_unassigned" }, options);

      const runner = await db("runners").where({ id: "runnerId" }).first();
      expect(runner.deleted_at).toBeNull();
    });
  });

  describe("delete_unhealthy", () => {
    it("retries the uncompleted run once", async () => {
      await db("runs")
        .update(buildRun({ started_at: minutesFromNow() }))
        .where({ id: "runId" });

      await db("runners").update({ run_id: "runId" }).where({ id: "runnerId" });
      await resetRunner({ id: "runnerId", type: "delete_unhealthy" }, options);

      const runner = await db("runners").where({ id: "runnerId" }).first();
      expect(runner).toMatchObject({
        api_key: null,
        deleted_at: expect.any(Date),
        ready_at: null,
        run_id: null,
        test_id: null,
      });

      const run = await findRun("runId", options);
      expect(run).toMatchObject({
        completed_at: null,
        retries: 1,
        started_at: null,
        status: "created",
      });
    });
  });

  describe("expire", () => {
    it("sets session_expires_at", async () => {
      await resetRunner({ id: "runnerId", type: "expire" }, options);

      const runner = await db("runners").where({ id: "runnerId" }).first();
      expect(runner.session_expires_at).toBeTruthy();
    });
  });

  describe("restart", () => {
    it("sets health_checked_at and restarted_at", async () => {
      await resetRunner({ id: "runnerId", type: "restart" }, options);

      const runner = await db("runners").where({ id: "runnerId" }).first();
      expect(runner).toMatchObject({
        health_checked_at: expect.any(Date),
        restarted_at: expect.any(Date),
      });
    });
  });
});

describe("updateRunner", () => {
  beforeAll(async () => {
    await db("runners").insert(buildRunner({}));
  });

  afterAll(() => db("runners").del());

  it("updates a runner", async () => {
    const deployed_at = minutesFromNow();
    const health_checked_at = minutesFromNow();
    const ready_at = minutesFromNow();
    const session_expires_at = minutesFromNow();

    await updateRunner(
      {
        api_key: "apiKey",
        deployed_at,
        health_checked_at,
        id: "runnerId",
        ready_at,
        session_expires_at,
      },
      options
    );

    const runner = await findRunner({ id: "runnerId" }, options);

    expect(runner).toMatchObject({
      api_key: "apiKey",
      deployed_at: new Date(deployed_at),
      health_checked_at: new Date(health_checked_at),
      id: "runnerId",
      ready_at: new Date(ready_at),
      session_expires_at: new Date(session_expires_at),
    });
  });

  it("throws an error when the runner is not found", async () => {
    await expect(
      updateRunner({ api_key: "apiKey", id: "fakeId" }, options)
    ).rejects.toThrowError("not found");
  });
});
