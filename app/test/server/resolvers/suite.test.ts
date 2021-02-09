import { db, dropTestDb, migrateDb } from "../../../server/db";
import { Logger } from "../../../server/Logger";
import * as suiteModel from "../../../server/models/suite";
import {
  createSuiteResolver,
  suiteResolver,
  suitesResolver,
} from "../../../server/resolvers/suite";
import { Suite } from "../../../server/types";
import { minutesFromNow } from "../../../shared/utils";
import {
  buildTeam,
  buildTest,
  buildTestTrigger,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const teams = [buildTeam({})];
const timestamp = minutesFromNow();
const suites = [
  {
    created_at: timestamp,
    creator_github_login: "spirit",
    creator_id: null,
    environment_variables: null,
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
    environment_variables: null,

    id: "suite2Id",
    repeat_minutes: 60,
    team_id: "teamId",
    trigger_id: "triggerId",
    trigger_name: "schedule",
  },
];
const user = buildUser({});

const testContext = { api_key: null, ip: null, logger, teams, user };

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(user);
  await db("teams").insert(teams);
});

afterAll(() => dropTestDb());

describe("createSuiteResolver", () => {
  beforeAll(async () => {
    await db("triggers").insert(buildTrigger({}));
    await db("tests").insert([buildTest({}), buildTest({ i: 2 })]);
    return db("test_triggers").insert([
      buildTestTrigger(),
      { ...buildTestTrigger(), id: "testTrigger2Id", test_id: "test2Id" },
    ]);
  });

  afterAll(async () => {
    await db("suites").del();
    await db("triggers").del();
    await db("tests").del();
    return db("test_triggers").del();
  });

  it("creates a suite for a trigger with all tests", async () => {
    const suiteId = await createSuiteResolver(
      {},
      { test_ids: null, trigger_id: "triggerId" },
      testContext
    );

    const suite = await db
      .select("*")
      .from("suites")
      .where({ id: suiteId })
      .first();
    expect(suite).toMatchObject({
      creator_id: user.id,
      team_id: teams[0].id,
      trigger_id: "triggerId",
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
      { test_ids: ["testId"], trigger_id: "triggerId" },
      testContext
    );

    const suite = await db
      .select("*")
      .from("suites")
      .where({ id: suiteId })
      .first();
    expect(suite).toMatchObject({
      creator_id: user.id,
      team_id: teams[0].id,
      trigger_id: "triggerId",
    });

    const runs = await db("runs").select("*").where({ suite_id: suite.id });
    expect(runs).toMatchObject([{ suite_id: suite.id, test_id: "testId" }]);

    await db("runs").del();
    await db("test_triggers").del();
    await db("tests").del();
  });

  it("throws an error if team is not enabled", async () => {
    const testFn = async (): Promise<string> => {
      return createSuiteResolver(
        {},
        { trigger_id: "triggerId" },
        { ...testContext, teams: [{ ...teams[0], is_enabled: false }] }
      );
    };

    await expect(testFn()).rejects.toThrowError(
      "team disabled, please contact support"
    );
  });

  it("throws an error if no tests exist for a team", async () => {
    const testFn = async (): Promise<string> => {
      return createSuiteResolver({}, { trigger_id: "triggerId" }, testContext);
    };

    await expect(testFn()).rejects.toThrowError("tests to run");
  });
});

describe("suiteResolver", () => {
  beforeAll(async () => {
    return db("triggers").insert(buildTrigger({}));
  });

  afterAll(async () => {
    return db("triggers").del();
  });

  it("returns a suite", async () => {
    jest.spyOn(suiteModel, "findSuite").mockResolvedValue(suites[0]);

    const suite = await suiteResolver({}, { id: "suiteId" }, testContext);

    expect(suite).toEqual(suites[0]);

    expect(suiteModel.findSuite).toBeCalledWith("suiteId", {
      logger: expect.any(Logger),
    });
  });

  it("throws an error if trigger deleted", async () => {
    await db("triggers").update({ deleted_at: minutesFromNow() });

    jest.spyOn(suiteModel, "findSuite").mockResolvedValue(suites[0]);

    const testFn = async (): Promise<Suite> => {
      return suiteResolver({}, { id: "suiteId" }, testContext);
    };

    await expect(testFn()).rejects.toThrowError("not found");

    await db("triggers").update({ deleted_at: null });
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
    jest.spyOn(suiteModel, "findSuitesForTrigger").mockResolvedValue(suites);

    const formattedSuites = await suitesResolver(
      { trigger_id: "triggerId" },
      {},
      testContext
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

    expect(suiteModel.findSuitesForTrigger).toBeCalledWith(
      {
        limit: 50,
        trigger_id: "triggerId",
      },
      expect.any(Logger)
    );
  });
});
