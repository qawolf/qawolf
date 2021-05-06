import { RunStatus } from "../../../lib/types";
import {
  RETRY_ERRORS,
  runCountResolver,
  shouldRetry,
  statusCountsResolver,
  suiteRunsResolver,
  testHistoryResolver,
} from "../../../server/resolvers/run";
import { Suite } from "../../../server/types";
import { prepareTestDb } from "../db";
import {
  buildRun,
  buildSuite,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildTrigger,
  buildUser,
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
});

afterEach(() => jest.restoreAllMocks());

describe("runCountResolver", () => {
  it("returns run count for a team", async () => {
    const count = await runCountResolver({}, { team_id: "teamId" }, context);

    expect(count).toBe(3);
  });
});

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

describe("statusCountsResolver", () => {
  it("returns the run status counts for a suite", async () => {
    const counts = await statusCountsResolver(
      { id: "suiteId" } as Suite,
      {},
      context
    );

    expect(counts).toEqual({
      created: 0,
      fail: 0,
      pass: 1,
    });
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
