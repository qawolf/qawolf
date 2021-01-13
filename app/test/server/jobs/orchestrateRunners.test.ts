import { db, dropTestDb, migrateDb } from "../../../server/db";
import environment from "../../../server/environment";
import * as orchestrateRunners from "../../../server/jobs/orchestrateRunners";
import * as runModel from "../../../server/models/run";
import * as testModel from "../../../server/models/test";
import { minutesFromNow } from "../../../server/utils";
import { buildRunner, logger } from "../utils";

describe("calculateRunnerPool", () => {
  let countPendingRuns: jest.SpyInstance;
  let countPendingTests: jest.SpyInstance;

  beforeAll(() => {
    countPendingRuns = jest
      .spyOn(runModel, "countPendingRuns")
      .mockResolvedValue(0);
    countPendingTests = jest.spyOn(testModel, "countPendingTests");
  });

  afterAll(() => jest.restoreAllMocks());

  it("includes the buffer", async () => {
    environment.RUNNER_LOCATIONS = {
      eastus2: { buffer: 1, latitude: 0, longitude: 0, reserved: 1 },
      japaneast: { buffer: 2, latitude: 0, longitude: 0, reserved: 2 },
    };

    countPendingTests.mockResolvedValue([]);

    const targets = await orchestrateRunners.calculateRunnerPool(logger);
    expect(targets).toEqual([
      { count: 1, location: "eastus2" },
      { count: 2, location: "japaneast" },
    ]);
  });

  it("includes the pending tests", async () => {
    environment.RUNNER_LOCATIONS = {
      eastus2: { buffer: 0, latitude: 0, longitude: 0, reserved: 0 },
    };

    countPendingTests.mockResolvedValue([{ count: 3, location: "eastus2" }]);

    const targets = await orchestrateRunners.calculateRunnerPool(logger);
    expect(targets).toEqual([{ count: 3, location: "eastus2" }]);
  });

  it("includes the pending runs", async () => {
    environment.RUNNER_LOCATIONS = {
      eastus2: { buffer: 0, latitude: 0, longitude: 0, reserved: 0 },
    };

    countPendingRuns.mockResolvedValue(3);
    countPendingTests.mockResolvedValue([{ count: 1, location: "eastus2" }]);

    const targets = await orchestrateRunners.calculateRunnerPool(logger);
    expect(targets).toEqual([{ count: 4, location: "eastus2" }]);
  });
});

describe("balanceRunnerPool", () => {
  let calculateRunnerPool: jest.SpyInstance;

  beforeAll(async () => {
    calculateRunnerPool = jest.spyOn(orchestrateRunners, "calculateRunnerPool");

    await migrateDb();
  });

  afterEach(() => db("runners").del());

  afterAll(() => dropTestDb());
  afterAll(() => jest.restoreAllMocks());

  it("creates runners to match the pool", async () => {
    calculateRunnerPool.mockResolvedValue([{ count: 2, location: "westus2" }]);

    await db("runners").insert(buildRunner({ location: "westus2" }));
    await orchestrateRunners.balanceRunnerPool(logger);

    const runners = await db("runners").where({ location: "westus2" });
    expect(runners.map((r) => r.deleted_at)).toEqual([null, null]);

    jest.resetAllMocks();
  });

  it("deletes unassigned runners to match pool, preferring non-ready runners", async () => {
    calculateRunnerPool.mockResolvedValue([{ count: 1, location: "westus2" }]);

    await db("runners").insert([
      buildRunner({
        api_key: "apiKey",
        location: "westus2",
        ready_at: minutesFromNow(),
      }),
      buildRunner({ i: 2, location: "westus2" }),
      buildRunner({ i: 3, location: "westus2" }),
    ]);

    await orchestrateRunners.balanceRunnerPool(logger);

    const runners = await db("runners").where({ location: "westus2" });

    expect(runners.find((r) => r.id === "runnerId")?.deleted_at).toEqual(null);

    expect(
      runners.filter((r) => r.id !== "runnerId").map((r) => r.deleted_at)
    ).toEqual([expect.any(Date), expect.any(Date)]);
  });
});
