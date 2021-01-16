import { db, dropTestDb, migrateDb } from "../../../server/db";
import environment from "../../../server/environment";
import * as runModel from "../../../server/models/run";
import {
  assignRunner,
  countExcessRunners,
  createRunners,
  deleteUnhealthyRunners,
  findPendingTestOrRunId,
  findRunner,
  findRunners,
  requestRunnerForTest,
  updateRunner,
} from "../../../server/models/runner";
import * as runnerModel from "../../../server/models/runner";
import * as testModel from "../../../server/models/test";
import { findTest, updateTest } from "../../../server/models/test";
import * as locationService from "../../../server/services/location";
import { Runner } from "../../../server/types";
import { minutesFromNow } from "../../../server/utils";
import {
  buildRun,
  buildRunner,
  buildTeam,
  buildTest,
  buildUser,
  logger,
} from "../utils";

const options = { logger };

beforeAll(async () => {
  await migrateDb();
  await db("teams").insert(buildTeam({}));
  await db("users").insert(buildUser({}));
  await db("tests").insert(buildTest({}));
  await db("runs").insert(buildRun({}));
});

afterAll(() => dropTestDb());

describe("assignRunner", () => {
  const runner = buildRunner({});

  beforeAll(async () => {
    await db("runners").insert(runner);
  });

  afterEach(async () => {
    await updateRunner(
      { id: "runnerId", run_id: null, test_id: null },
      options
    );
  });

  afterAll(() => db("runners").del());

  it("assigns a run to the runner", async () => {
    await assignRunner({ runner, run_id: "runId" }, options);

    const result = await findRunner({ id: "runnerId" }, { logger });
    expect(result).toMatchObject({ id: "runnerId", run_id: "runId" });
  });

  it("assigns a test to the runner", async () => {
    await updateTest(
      { id: "testId", runner_requested_at: minutesFromNow() },
      { logger }
    );
    await assignRunner({ runner, test_id: "testId" }, { logger });

    const result = await findRunner({ id: "runnerId" }, { logger });
    expect(result).toMatchObject({ id: "runnerId", test_id: "testId" });

    // check it clears test.runner_request_at when it is assigned
    const test = await findTest("testId", { logger });
    expect(test).toMatchObject({ runner_requested_at: null });
  });
});

describe("countExcessRunners", () => {
  const runners = [
    buildRunner({ api_key: "apiKey", ready_at: minutesFromNow() }),
    buildRunner({ api_key: "apiKey", i: 2, ready_at: minutesFromNow() }),
  ];

  beforeAll(() => db("runners").insert(runners));
  afterAll(() => db("runners").del());

  it("subtracts reserved from available runners", async () => {
    environment.RUNNER_LOCATIONS = {
      westus2: { buffer: 2, latitude: 0, longitude: 0, reserved: 1 },
    };

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
      { logger }
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
    const runner = await findRunner({ run_id: "runId" }, options);
    expect(runner.id).toEqual("runnerId");
  });

  it("finds a runner by test_id", async () => {
    const runner = await findRunner({ test_id: "testId" }, options);
    expect(runner.id).toEqual("runner2Id");
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
    await updateRunner(
      { id: "runnerId", deleted_at: minutesFromNow() },
      { logger }
    );

    const runner = await findRunner({ id: "runnerId" }, options);
    expect(runner).toBeNull();

    const runner2 = await findRunner(
      { id: "runnerId", include_deleted: true },
      options
    );
    expect(runner2.id).toEqual("runnerId");

    await db("runners").update({ deleted_at: null }).where({ id: "runnerId" });
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
    const pending = await findPendingTestOrRunId("eastus2", { logger });
    expect(pending).toMatchObject({ test_id: "pendingTestId" });
  });

  it("does not returns a run if there are no excess runners", async () => {
    findPendingTestSpy.mockResolvedValue(null);
    countExcessRunnersSpy.mockResolvedValue(0);
    const pending = await findPendingTestOrRunId("eastus2", { logger });
    expect(pending).toEqual(null);
  });

  it("returns a run if there are excess runners", async () => {
    findPendingTestSpy.mockResolvedValue(null);
    countExcessRunnersSpy.mockResolvedValue(1);
    const pending = await findPendingTestOrRunId("eastus2", { logger });
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
      { logger }
    );
    expect(result).toEqual(runner);

    expect(assignRunner).toBeCalledWith({ runner, test_id: "testId" }, options);
  });

  it("updates the test to pending if a runner if not available", async () => {
    jest.spyOn(runnerModel, "findRunner").mockResolvedValue(null);

    const assignRunner = jest.spyOn(runnerModel, "assignRunner").mockReset();
    const updateTest = jest.spyOn(testModel, "updateTest");

    const result = await requestRunnerForTest(
      { ip: "", test: buildTest({}) },
      options
    );
    expect(result).toBeNull();

    expect(assignRunner).not.toBeCalled();

    expect(updateTest).toBeCalledWith(
      {
        id: "testId",
        runner_locations: ["eastus2", "westus2"],
        runner_requested_at: expect.any(String),
      },
      options
    );
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
    const restarted_at = minutesFromNow();
    const session_expires_at = minutesFromNow();

    await updateRunner(
      {
        api_key: "apiKey",
        deployed_at,
        health_checked_at,
        id: "runnerId",
        ready_at,
        restarted_at,
        session_expires_at,
      },
      { logger }
    );

    const runner = await findRunner({ id: "runnerId" }, { logger });

    expect(runner).toMatchObject({
      api_key: "apiKey",
      deployed_at: new Date(deployed_at),
      health_checked_at: new Date(health_checked_at),
      id: "runnerId",
      ready_at: new Date(ready_at),
      restarted_at: new Date(restarted_at),
      session_expires_at: new Date(session_expires_at),
    });
  });

  it("unassigns the test when the runner is deleted", async () => {
    await db("runners").update({ run_id: null, test_id: "testId" });

    const runner = await updateRunner(
      { deleted_at: minutesFromNow(), id: "runnerId" },
      { logger }
    );
    expect(runner).toMatchObject({ test_id: null });

    await db("runners").update({ deleted_at: null }).where({ id: "runnerId" });
  });

  it("fails a uncompleted run when the runner is unassigned", async () => {
    await db("runners").update({ run_id: "runId", test_id: null });

    // check it fails the run when it is unassigned since it was not completed
    await updateRunner({ id: "runnerId", run_id: null }, { logger });
    const run = await runModel.findRun("runId", { logger });
    expect(run).toMatchObject({ status: "fail" });
  });

  it("unassigns the run when the runner is deleted", async () => {
    await db("runners").update({ run_id: "runId", test_id: null });

    const runner = await updateRunner(
      { deleted_at: minutesFromNow(), id: "runnerId" },
      { logger }
    );
    expect(runner).toMatchObject({ run_id: null });

    await db("runners").update({ deleted_at: null }).where({ id: "runnerId" });
  });

  it("throws an error when the runner is not found", async () => {
    const testFn = async (): Promise<Runner> =>
      updateRunner({ api_key: "apiKey", id: "fakeId" }, { logger });

    await expect(testFn()).rejects.toThrowError("not found");
  });
});
