import { db, dropTestDb, migrateDb } from "../../../server/db";
import * as runnerModel from "../../../server/models/runner";
import {
  suiteRunsResolver,
  updateRunResolver,
  validateApiKey,
} from "../../../server/resolvers/run";
import * as runResolver from "../../../server/resolvers/run";
import * as alertService from "../../../server/services/alert/send";
import { Suite } from "../../../server/types";
import {
  buildGroup,
  buildRun,
  buildRunner,
  buildSuite,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildUser,
  logger,
} from "../utils";

const runs = [
  buildRun({}),
  buildRun({ i: 2, status: "pass", suite_id: "suiteId", test_id: "test2Id" }),
  buildRun({ i: 3 }),
];
const teams = [buildTeam({})];
const test = buildTest({});
const user = buildUser({});

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(user);
  await db("teams").insert(teams);
  await db("team_users").insert(buildTeamUser({}));

  await db("groups").insert(buildGroup({}));

  await db("suites").insert(buildSuite({ team_id: "teamId" }));
  await db("tests").insert([test, buildTest({ i: 2, name: "testName" })]);

  await db("runs").insert(runs);

  await db("runners").insert([
    buildRunner({ api_key: "apiKey", run_id: "runId" }),
    buildRunner({ api_key: "apiKey", i: 2, run_id: "run2Id" }),
    buildRunner({ api_key: "apiKey", i: 3, run_id: "run3Id" }),
  ]);
});

afterAll(() => dropTestDb());

afterEach(jest.restoreAllMocks);

describe("suiteRunsResolver", () => {
  it("returns the runs for a suite", async () => {
    const runs = await suiteRunsResolver(
      { id: "suiteId" } as Suite,
      {},
      { api_key: null, ip: null, logger, teams, user }
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

describe("updateRunResolver", () => {
  beforeEach(() => {
    jest.spyOn(alertService, "sendAlert").mockResolvedValue();
    jest.spyOn(runnerModel, "expireRunner").mockResolvedValue();
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
      { api_key: "apiKey", ip: null, logger, teams, user }
    );

    const run = await db("runs").select("*").where({ id: "runId" }).first();

    expect(run.started_at).toBeTruthy();
  });

  it("updates the run if run failed", async () => {
    await updateRunResolver(
      {},
      { current_line: 2, id: "run2Id", status: "fail" },
      { api_key: "apiKey", ip: null, logger, teams, user }
    );

    const run = await db("runs").select("*").where({ id: "run2Id" }).first();

    expect(run).toMatchObject({ current_line: 2, status: "fail" });
    expect(runnerModel.expireRunner).not.toBeCalled();
  });

  it("updates the run and expires the runner if run succeeded", async () => {
    await updateRunResolver(
      {},
      { current_line: 2, id: "run2Id", status: "pass" },
      { api_key: "apiKey", ip: null, logger, teams, user }
    );

    const run = await db("runs").select("*").where({ id: "run2Id" }).first();

    expect(run).toMatchObject({ current_line: 2, status: "pass" });
    expect(runnerModel.expireRunner).toBeCalled();
  });
});

describe("validateApiKey", () => {
  const [run] = runs;

  it("throws an error if api key not provided", async () => {
    const testFn = async (): Promise<void> => {
      return validateApiKey({ api_key: null, run }, { logger });
    };

    await expect(testFn()).rejects.toThrowError("invalid api key");
  });

  it("throws an error if api key does not match runner", async () => {
    const testFn = async (): Promise<void> => {
      return validateApiKey({ api_key: "wrongApiKey", run }, { logger });
    };

    await expect(testFn()).rejects.toThrowError("invalid api key");
  });

  it("does not throw an error if api key matches runner", async () => {
    const testFn = async (): Promise<void> => {
      return validateApiKey({ api_key: "apiKey", run }, { logger });
    };

    await expect(testFn()).resolves.not.toThrowError();
  });
});
