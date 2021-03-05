import { decrypt, encrypt } from "../../../server/models/encrypt";
import * as suiteModel from "../../../server/models/suite";
import {
  createSuiteResolver,
  suiteResolver,
  suitesResolver,
} from "../../../server/resolvers/suite";
import { Trigger } from "../../../server/types";
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
      {
        environment_id: null,
        environment_variables: "",
        test_ids: ["testId", "test2Id"],
      },
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
      environment_variables: null,
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
      {
        environment_id: "environmentId",
        environment_variables: JSON.stringify({ hello: "world" }),
        test_ids: ["testId"],
      },
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

    expect(decrypt(suite.environment_variables)).toBe(
      JSON.stringify({ hello: "world" })
    );

    const runs = await db("runs").select("*").where({ suite_id: suite.id });
    expect(runs).toMatchObject([{ suite_id: suite.id, test_id: "testId" }]);
  });

  it("throws an error if team is not enabled", async () => {
    await expect(
      createSuiteResolver(
        {},
        {
          environment_id: null,
          environment_variables: null,
          test_ids: ["testId"],
        },
        { ...context, teams: [{ ...teams[0], is_enabled: false }] }
      )
    ).rejects.toThrowError("team disabled, please contact support");
  });

  it("throws an error if no tests", async () => {
    await expect(
      createSuiteResolver(
        {},
        { environment_id: null, environment_variables: null, test_ids: [] },
        context
      )
    ).rejects.toThrowError("tests to run");
  });

  it("throws an error if trying to create suite with tests from multiple teams", async () => {
    const team2 = buildTeam({ i: 2 });

    await db("teams").insert(team2);
    await db("tests").insert(buildTest({ i: 10, team_id: "team2Id" }));

    await expect(
      createSuiteResolver(
        {},
        {
          environment_id: null,
          environment_variables: null,
          test_ids: ["testId", "test10Id"],
        },
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
    const findSuiteSpy = jest.spyOn(suiteModel, "findSuite").mockResolvedValue({
      ...suites[0],
      environment_id: "environmentId",
    });

    const suite = await suiteResolver({}, { id: "suiteId" }, context);

    expect(suite).toMatchObject({
      ...suites[0],
      environment_id: "environmentId",
      environment_name: "Staging",
      environment_variables: JSON.stringify({ hello: "world" }),
      trigger: {
        id: "triggerId",
      },
      trigger_id: "triggerId",
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
      environment_name: null,
      environment_variables: JSON.stringify({ hello: "world" }),
      trigger: null,
      trigger_id: null,
    });
  });

  it("returns a suite with a deleted environment and trigger", async () => {
    await db("triggers").update({ deleted_at: minutesFromNow() });

    jest.spyOn(suiteModel, "findSuite").mockResolvedValue({
      ...suites[0],
      environment_id: "deletedId",
      trigger_id: null,
    });

    const suite = await suiteResolver({}, { id: "suiteId" }, context);

    expect(suite).toEqual({
      ...suites[0],
      environment_id: null,
      environment_name: null,
      environment_variables: JSON.stringify({ hello: "world" }),
      trigger: null,
      trigger_id: null,
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
    const findSuitesforTeamSpy = jest
      .spyOn(suiteModel, "findSuitesForTeam")
      .mockResolvedValue(
        suites.map((s) => {
          return {
            ...s,
            environment_name: "staging",
            trigger: {
              color: "pink",
              name: "trigger1",
            } as Trigger,
          };
        })
      );

    const formattedSuites = await suitesResolver(
      {},
      { team_id: "teamId" },
      context
    );

    expect(formattedSuites).toMatchObject([
      {
        created_at: timestamp,
        environment_name: "staging",
        id: "suiteId",
        repeat_minutes: 60,
        team_id: "teamId",
        trigger: {
          color: "pink",
          name: "trigger1",
        },
      },
      {
        created_at: timestamp,
        environment_name: "staging",
        id: "suite2Id",
        repeat_minutes: 60,
        team_id: "teamId",
        trigger: {
          color: "pink",
          name: "trigger1",
        },
      },
    ]);

    expect(findSuitesforTeamSpy.mock.calls[0][0]).toEqual({
      limit: 25,
      team_id: "teamId",
    });
  });
});
