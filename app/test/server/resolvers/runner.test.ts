import * as runnerResolvers from "../../../server/resolvers/runner";
import { prepareTestDb } from "../db";
import {
  buildEnvironmentVariable,
  buildRun,
  buildTest,
  logger,
  testContext,
} from "../utils";

const { runnerResolver } = runnerResolvers;

jest.mock("axios");

const db = prepareTestDb();
const context = { ...testContext, api_key: "apiKey", db };
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(context.user);
  await db("teams").insert(context.teams[0]);

  await db("environment_variables").insert({
    ...buildEnvironmentVariable({ name: "RUNNER_LOCATIONS" }),
    environment_id: null,
    is_system: true,
    team_id: null,
    value: JSON.stringify({
      westus2: { buffer: 2, latitude: 0, longitude: 0, reserved: 1 },
    }),
  });
});

describe("runnerResolver", () => {
  beforeAll(async () => {
    await db("tests").insert([buildTest({}), buildTest({ i: 2 })]);
    await db("runs").insert(buildRun({}));
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

  it("extends the current runner's session when request_test_runner is specified", async () => {
    const initialExpiresAt = (
      await findRunner({ test_id: "testId" }, { db, logger })
    ).session_expires_at;

    const runner = await runnerResolver(
      null,
      { request_test_runner: true, test_id: "testId" },
      context
    );
    expect(runner).toEqual({
      api_key: null,
      ws_url: "wss://westus2.qawolf.com/runner/runner2Id/.qawolf",
    });

    const dbRunner = await findRunner({ test_id: "testId" }, options);
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
      { request_test_runner: true, test_branch: "main", test_id: "test2Id" },
      context
    );

    expect(spy.mock.calls[0][0]).toMatchObject({
      ip: context.ip,
      test: expect.objectContaining({
        id: "test2Id",
        runner_requested_branch: "main",
      }),
    });
  });
});
