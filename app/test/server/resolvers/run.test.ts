import { RunStatus } from "../../../lib/types";
import * as runnerModel from "../../../server/models/runner";
import {
  RETRY_ERRORS,
  shouldRetry,
  suiteRunsResolver,
  testHistoryResolver,
  updateRunResolver,
  validateApiKey,
} from "../../../server/resolvers/run";
import * as runResolver from "../../../server/resolvers/run";
import * as alertService from "../../../server/services/alert/send";
import { Suite } from "../../../server/types";
import { prepareTestDb } from "../db";
import {
  buildRun,
  buildRunner,
  buildSuite,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
  testContext,
} from "../utils";

const runs = [
  buildRun({}),
  buildRun({ i: 2, status: "pass", suite_id: "suiteId", test_id: "test2Id" }),
  buildRun({ i: 3 }),
];
const teams = [buildTeam({})];
const test = buildTest({});
const user = buildUser({});

const db = prepareTestDb();
const context = { ...testContext, db };

beforeAll(async () => {
  await db("users").insert(user);
  await db("teams").insert(teams);
  await db("team_users").insert(buildTeamUser({}));

  await db("triggers").insert(buildTrigger({}));

  await db("suites").insert(buildSuite({ team_id: "teamId" }));
  await db("tests").insert([test, buildTest({ i: 2, name: "testName" })]);

  await db("runs").insert(runs);

  await db("runners").insert([
    buildRunner({ api_key: "apiKey", run_id: "runId" }),
    buildRunner({ api_key: "apiKey", i: 2, run_id: "run2Id" }),
    buildRunner({ api_key: "apiKey", i: 3, run_id: "run3Id" }),
  ]);
});

afterEach(() => jest.restoreAllMocks());

describe("shouldRetry", () => {
  const retryOptions = {
    error: RETRY_ERRORS[0],
    status: "fail" as RunStatus,
  };

  it("retries for ERR_CONNECTION_REFUSED", () => {
    expect(shouldRetry(retryOptions)).toEqual(true);
  });

  it("does not retry more than once", () => {
    expect(shouldRetry({ ...retryOptions, retries: 1 })).toEqual(false);
  });

  it("does not retry passing runs", () => {
    expect(
      shouldRetry({ ...retryOptions, status: "pass" as RunStatus })
    ).toEqual(false);
  });
});

describe("suiteRunsResolver", () => {
  it("returns the runs for a suite", async () => {
    const runs = await suiteRunsResolver(
      { id: "suiteId" } as Suite,
      {},
      context
    );

    expect(runs).toMatchObject([
      {
        id: "run2Id",
        status: "pass",
        test_name: "testName",
      },
    ]);
  });
});

describe("testHistoryResolver", () => {
  it("returns the last runs for a test", async () => {
    const runs = await testHistoryResolver({}, { id: "testId" }, context);

    expect(runs).toMatchObject([{ id: "runId" }, { id: "run3Id" }]);
  });
});

describe("updateRunResolver", () => {
  beforeEach(() => {
    jest.spyOn(alertService, "sendAlert").mockResolvedValue();
    jest.spyOn(runnerModel, "resetRunner").mockResolvedValue();
    jest.spyOn(runResolver, "validateApiKey").mockResolvedValue();
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    return db("runs").update({
      current_line: null,
      status: "created",
      started_at: null,
    });
  });

  it("updates run start time", async () => {
    await updateRunResolver(
      {},
      { current_line: null, id: "runId", status: "created" },
      context
    );

    const run = await db("runs").select("*").where({ id: "runId" }).first();

    expect(run.started_at).toBeTruthy();
  });

  it("updates the run and expires the runner if run failed", async () => {
    await updateRunResolver(
      {},
      { current_line: 2, id: "run2Id", status: "fail" },
      context
    );

    const run = await db("runs").select("*").where({ id: "run2Id" }).first();

    expect(run).toMatchObject({ current_line: 2, status: "fail" });
    expect(runnerModel.resetRunner).toBeCalled();
  });

  it("updates the run and expires the runner if run succeeded", async () => {
    await updateRunResolver(
      {},
      { current_line: 2, id: "run2Id", status: "pass" },
      context
    );

    const run = await db("runs").select("*").where({ id: "run2Id" }).first();

    expect(run).toMatchObject({ current_line: 2, status: "pass" });
    expect(runnerModel.resetRunner).toBeCalled();
  });

  it("retries the run if shouldRetry is true", async () => {
    await updateRunResolver(
      {},
      { error: RETRY_ERRORS[0], current_line: 2, id: "run2Id", status: "fail" },
      context
    );

    const run = await db("runs").select("*").where({ id: "run2Id" }).first();

    expect(run).toMatchObject({
      retries: 1,
      started_at: null,
      status: "created",
    });
    expect(runnerModel.resetRunner).toBeCalled();
  });
});

describe("validateApiKey", () => {
  const [run] = runs;

  it("throws an error if api key not provided", async () => {
    await expect(
      validateApiKey({ api_key: null, run }, { db, logger })
    ).rejects.toThrowError("invalid api key");
  });

  it("throws an error if api key does not match runner", async () => {
    await expect(
      validateApiKey({ api_key: "wrongApiKey", run }, { db, logger })
    ).rejects.toThrowError("invalid api key");
  });

  it("does not throw an error if api key matches runner", async () => {
    await expect(
      validateApiKey({ api_key: "apiKey", run }, { db, logger })
    ).resolves.not.toThrowError();
  });
});
