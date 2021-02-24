import { encrypt } from "../../../server/models/encrypt";
import * as suiteModel from "../../../server/models/suite";
import {
  createSuiteResolver,
  suiteResolver,
  suitesResolver,
} from "../../../server/resolvers/suite";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildEnvironment,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  testContext,
} from "../utils";

const teams = [buildTeam({})];
const timestamp = minutesFromNow();
const suites = [
  {
    created_at: timestamp,
    creator_github_login: "spirit",
    creator_id: null,
    environment_id: null,
    environment_variables: encrypt(JSON.stringify({ hello: "world" })),
    id: "suiteId",
    repeat_minutes: 60,
    team_id: "teamId",
    trigger_id: "triggerId",
    trigger_name: "schedule",
  },
  {
    created_at: timestamp,
    creator_github_login: null,
    creator_id: null,
    environment_id: null,
    environment_variables: null,
    id: "suite2Id",
    repeat_minutes: 60,
    team_id: "teamId",
    trigger_id: "triggerId",
    trigger_name: "schedule",
  },
];
const user = buildUser({});

const db = prepareTestDb();
const context = { ...testContext, api_key: "apiKey", db };

beforeAll(async () => {
  await db("users").insert(user);
  await db("teams").insert(teams);

  await db("environments").insert(buildEnvironment({}));
});

describe("createSuiteResolver", () => {
  beforeAll(async () => {
    return db("tests").insert([buildTest({}), buildTest({ i: 2 })]);
  });

  afterAll(async () => {
    await db("runs").del();
    await db("suites").del();

    return db("tests").del();
  });

  it("creates a suite for tests", async () => {
    const suiteId = await createSuiteResolver(
      {},
      { environment_id: null, test_ids: ["testId", "test2Id"] },
      context
    );

    const suite = await db
      .select("*")
      .from("suites")
      .where({ id: suiteId })
      .first();
    expect(suite).toMatchObject({
      creator_id: user.id,
      environment_id: null,
      team_id: teams[0].id,
      trigger_id: null,
    });

    const runs = await db("runs").select("*").where({ suite_id: suite.id });
    expect(runs).toMatchObject([
      { suite_id: suite.id, test_id: "testId" },
      { suite_id: suite.id, test_id: "test2Id" },
    ]);
  });

  it("creates a suite for a trigger with selected tests", async () => {
    const suiteId = await createSuiteResolver(
      {},
      { environment_id: "environmentId", test_ids: ["testId"] },
      context
    );

    const suite = await db
      .select("*")
      .from("suites")
      .where({ id: suiteId })
      .first();
    expect(suite).toMatchObject({
      creator_id: user.id,
      environment_id: "environmentId",
      team_id: teams[0].id,
      trigger_id: null,
    });

    const runs = await db("runs").select("*").where({ suite_id: suite.id });
    expect(runs).toMatchObject([{ suite_id: suite.id, test_id: "testId" }]);
  });

  it("throws an error if team is not enabled", async () => {
    await expect(
      createSuiteResolver(
        {},
        { environment_id: null, test_ids: ["testId"] },
        { ...context, teams: [{ ...teams[0], is_enabled: false }] }
      )
    ).rejects.toThrowError("team disabled, please contact support");
  });

  it("throws an error if no tests", async () => {
    await expect(
      createSuiteResolver({}, { environment_id: null, test_ids: [] }, context)
    ).rejects.toThrowError("tests to run");
  });

  it("throws an error if trying to create suite with tests from multiple teams", async () => {
    const team2 = buildTeam({ i: 2 });

    await db("teams").insert(team2);
    await db("tests").insert(buildTest({ i: 10, team_id: "team2Id" }));

    await expect(
      createSuiteResolver(
        {},
        { environment_id: null, test_ids: ["testId", "test10Id"] },
        { ...context, teams: [...teams, team2] }
      )
    ).rejects.toThrowError("different teams");

    await db("tests").where({ id: "test10Id" }).del();
    await db("teams").where({ id: "team2Id" }).del();
  });
});

describe("suiteResolver", () => {
  beforeAll(() => {
    return db("triggers").insert(buildTrigger({}));
  });

  afterAll(() => db("triggers").del());

  it("returns a suite", async () => {
    const findSuiteSpy = jest
      .spyOn(suiteModel, "findSuite")
      .mockResolvedValue(suites[0]);

    const suite = await suiteResolver({}, { id: "suiteId" }, context);

    expect(suite).toEqual({
      ...suites[0],
      environment_id: null,
      environment_variables: JSON.stringify({ hello: "world" }),
      trigger_color: "#4545E5",
      trigger_name: "trigger1",
    });

    expect(findSuiteSpy.mock.calls[0][0]).toEqual("suiteId");
  });

  it("returns a suite without a trigger", async () => {
    jest
      .spyOn(suiteModel, "findSuite")
      .mockResolvedValue({ ...suites[0], trigger_id: null });

    const suite = await suiteResolver({}, { id: "suiteId" }, context);

    expect(suite).toEqual({
      ...suites[0],
      environment_id: null,
      environment_variables: JSON.stringify({ hello: "world" }),
      trigger_color: null,
      trigger_id: null,
      trigger_name: null,
    });
  });

  it("returns a suite with a deleted trigger trigger", async () => {
    await db("triggers").update({ deleted_at: minutesFromNow() });

    jest
      .spyOn(suiteModel, "findSuite")
      .mockResolvedValue({ ...suites[0], trigger_id: null });

    const suite = await suiteResolver({}, { id: "suiteId" }, context);

    expect(suite).toEqual({
      ...suites[0],
      environment_id: null,
      environment_variables: JSON.stringify({ hello: "world" }),
      trigger_color: null,
      trigger_id: null,
      trigger_name: null,
    });
  });
});

describe("suitesResolver", () => {
  beforeAll(async () => {
    return db("triggers").insert(buildTrigger({}));
  });

  afterAll(async () => {
    return db("triggers").del();
  });

  it("returns suites for a team", async () => {
    const findSuitesForTriggerSpy = jest
      .spyOn(suiteModel, "findSuitesForTrigger")
      .mockResolvedValue(suites);

    const formattedSuites = await suitesResolver(
      { trigger_id: "triggerId" },
      {},
      context
    );

    expect(formattedSuites).toMatchObject([
      {
        created_at: timestamp,
        id: "suiteId",
        repeat_minutes: 60,
        team_id: "teamId",
        trigger_name: "schedule",
      },
      {
        created_at: timestamp,
        id: "suite2Id",
        repeat_minutes: 60,
        team_id: "teamId",
        trigger_name: "schedule",
      },
    ]);

    expect(findSuitesForTriggerSpy.mock.calls[0][0]).toEqual({
      limit: 50,
      trigger_id: "triggerId",
    });
  });
});
