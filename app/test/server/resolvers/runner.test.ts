import axios from "axios";

import { db, dropTestDb, migrateDb } from "../../../server/db";
import * as runModel from "../../../server/models/run";
import * as runnerModel from "../../../server/models/runner";
import { findRunner, updateRunner } from "../../../server/models/runner";
import { findTest } from "../../../server/models/test";
import * as runnerResolvers from "../../../server/resolvers/runner";
import { Runner, RunnerRun } from "../../../server/types";
import { minutesFromNow } from "../../../shared/utils";
import {
  buildRun,
  buildRunner,
  buildTeam,
  buildTest,
  buildUser,
  logger,
} from "../utils";

const {
  authenticateRunner,
  runnerResolver,
  updateRunnerResolver,
} = runnerResolvers;

jest.mock("axios");

const context = {
  api_key: "apiKey",
  ip: "127.0.0.1",
  logger,
  teams: [buildTeam({})],
  user: buildUser({}),
};

beforeAll(async () => {
  await migrateDb();
  await db("users").insert(context.user);
  await db("teams").insert(context.teams[0]);
});

afterAll(() => dropTestDb());

describe("authenticateRunner", () => {
  it("resolves if api key valid", async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (axios.get as any).mockResolvedValueOnce({});

    const testFn = async (): Promise<void> => {
      return authenticateRunner(
        { id: "", location: "", api_key: "apiKey" },
        logger
      );
    };

    await expect(testFn()).resolves.not.toThrowError();
  });

  it("throws an error if api key not valid", async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (axios.get as any).mockRejectedValueOnce(new Error("invalid"));

    const testFn = async (): Promise<void> => {
      return authenticateRunner(
        { id: "", location: "", api_key: "apiKey" },
        logger
      );
    };

    await expect(testFn()).rejects.toThrowError("invalid api key");
  });
});

describe("runnerResolver", () => {
  beforeAll(async () => {
    await db("tests").insert([buildTest({}), buildTest({ i: 2 })]);
    await db("runs").insert(buildRun({}));
    await db("runners").insert([
      buildRunner({ run_id: "runId" }),
      buildRunner({ i: 2, test_id: "testId" }),
    ]);
  });

  afterAll(async () => {
    await db("runners").del();
    await db("runs").del();
    await db("tests").del();
    jest.restoreAllMocks();
  });

  it("returns the run's runner", async () => {
    jest.spyOn(runnerModel, "updateRunner");

    const runner = await runnerResolver(null, { run_id: "runId" }, context);
    expect(runner).toEqual({
      api_key: null,
      ws_url: "wss://westus2.qawolf.com/runner/runnerId/.qawolf",
    });

    expect(runnerModel.updateRunner).not.toBeCalled();
  });

  it("extends the current runner's session when should_request_runner is specified", async () => {
    const initialExpiresAt = (await findRunner({ run_id: "runId" }, { logger }))
      .session_expires_at;

    const runner = await runnerResolver(
      null,
      { run_id: "runId", should_request_runner: true },
      context
    );
    expect(runner).toEqual({
      api_key: null,
      ws_url: "wss://westus2.qawolf.com/runner/runnerId/.qawolf",
    });

    const dbRunner = await findRunner({ run_id: "runId" }, { logger });
    expect(dbRunner.session_expires_at).not.toBe(initialExpiresAt);
  });

  it("returns the test's runner", async () => {
    const runner = await runnerResolver(null, { test_id: "testId" }, context);
    expect(runner).toEqual({
      api_key: null,
      ws_url: "wss://westus2.qawolf.com/runner/runner2Id/.qawolf",
    });
  });

  it("requests a runner", async () => {
    const spy = jest
      .spyOn(runnerModel, "requestRunnerForTest")
      .mockResolvedValue(null);

    await runnerResolver(
      null,
      { should_request_runner: true, test_id: "test2Id" },
      context
    );

    expect(spy.mock.calls[0][0]).toMatchObject({
      ip: context.ip,
      test: expect.objectContaining({ id: "test2Id" }),
    });
  });
});

describe("updateRunnerResolver", () => {
  let authenticateRunnerSpy: jest.SpyInstance;

  beforeAll(async () => {
    await db("tests").insert(
      buildTest({
        runner_requested_at: minutesFromNow(),
        runner_locations: ["eastus2"],
      })
    );
    await db("runs").insert(buildRun({}));

    await db("runners").insert([
      buildRunner({ location: "eastus2" }),
      buildRunner({ api_key: "apiKey", i: 2, ready_at: minutesFromNow() }),
    ]);

    authenticateRunnerSpy = jest
      .spyOn(runnerResolvers, "authenticateRunner")
      .mockResolvedValueOnce();
  });

  afterAll(async () => {
    await db("runners").del();
    await db("runs").del();
    await db("tests").del();
  });

  describe("update is_ready", () => {
    let runner: Runner;

    beforeAll(async () => {
      await updateRunnerResolver(
        {},
        { id: "runnerId", is_ready: true },
        context
      );

      runner = await db("runners").where({ id: "runnerId" }).first();
    });

    afterAll(async () => {
      await db("runners").update({ id: "runnerId", test_id: null }).first();
    });

    it("assigns a test", async () => {
      expect(runner).toMatchObject({
        session_expires_at: expect.any(Date),
        test_id: "testId",
      });

      const test = await findTest("testId", { logger });
      expect(test).toMatchObject({ runner_requested_at: null });
    });

    it("authenticates the runner", () => {
      expect(authenticateRunnerSpy).toBeCalled();
    });

    it("updates api_key, health_checked_at and ready_at", async () => {
      expect(runner).toMatchObject({
        api_key: "apiKey",
        health_checked_at: expect.any(Date),
        ready_at: expect.any(Date),
      });
    });

    it("throws an error if an api_key is not provided", async () => {
      await expect(
        updateRunnerResolver(
          {},
          { id: "runnerId", is_ready: true },
          { ...context, api_key: null }
        )
      ).rejects.toThrowError("must provide api_key");
    });
  });

  describe("update is_healthy", () => {
    it("authenticates the api key", async () => {
      const testFn = async (): Promise<RunnerRun | null> => {
        return updateRunnerResolver(
          {},
          { id: "runnerId", is_healthy: true },
          { ...context, api_key: "fakeKey" }
        );
      };

      await expect(testFn()).rejects.toThrowError("invalid api key");
    });

    it("skips if the runner is not ready", async () => {
      await updateRunner(
        { health_checked_at: null, id: "runnerId", ready_at: null },
        { logger }
      );

      const run = await updateRunnerResolver(
        {},
        { id: "runnerId", is_healthy: true },
        context
      );
      expect(run).toBeNull();

      const runner = await db("runners").where({ id: "runnerId" }).first();
      expect(runner.health_checked_at).toEqual(null);
    });

    it("assigns a run", async () => {
      const findSuiteRunForRunnerSpy: jest.SpyInstance = jest.spyOn(
        runModel,
        "findSuiteRunForRunner"
      );
      findSuiteRunForRunnerSpy.mockResolvedValue({
        id: "mockedSuiteRunForRunnerId",
      });

      await updateRunner(
        { id: "runnerId", ready_at: minutesFromNow(), test_id: null },
        { logger }
      );

      const result = await updateRunnerResolver(
        {},
        { id: "runnerId", is_healthy: true },
        context
      );
      expect(result).toMatchObject({ id: "mockedSuiteRunForRunnerId" });

      const runner = await findRunner({ id: "runnerId" }, { logger });
      expect(runner).toMatchObject({
        run_id: "runId",
        session_expires_at: expect.any(Date),
      });
    });
  });
});
