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
  buildGroup,
  buildGroupTest,
  buildTeam,
  buildTest,
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
    group_id: "groupId",
    group_name: "schedule",
    id: "suiteId",
    team_id: "teamId",
    repeat_minutes: 60,
  },
  {
    created_at: timestamp,
    creator_github_login: null,
    creator_id: null,
    environment_variables: null,
    group_id: "groupId",
    group_name: "schedule",
    id: "suite2Id",
    team_id: "teamId",
    repeat_minutes: 60,
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
    await db("groups").insert(buildGroup({}));
    await db("tests").insert([buildTest({}), buildTest({ i: 2 })]);
    return db("group_tests").insert([
      buildGroupTest(),
      { ...buildGroupTest(), id: "groupTest2Id", test_id: "test2Id" },
    ]);
  });

  afterAll(async () => {
    await db("suites").del();
    await db("groups").del();
    await db("tests").del();
    return db("group_tests").del();
  });

  it("creates a suite for a group with all tests", async () => {
    const suiteId = await createSuiteResolver(
      {},
      { group_id: "groupId", test_ids: null },
      testContext
    );

    const suite = await db
      .select("*")
      .from("suites")
      .where({ id: suiteId })
      .first();
    expect(suite).toMatchObject({
      creator_id: user.id,
      group_id: "groupId",
      team_id: teams[0].id,
    });

    const runs = await db("runs").select("*").where({ suite_id: suite.id });
    expect(runs).toMatchObject([
      { suite_id: suite.id, test_id: "testId" },
      { suite_id: suite.id, test_id: "test2Id" },
    ]);
  });

  it("creates a suite for a group with selected tests", async () => {
    const suiteId = await createSuiteResolver(
      {},
      { group_id: "groupId", test_ids: ["testId"] },
      testContext
    );

    const suite = await db
      .select("*")
      .from("suites")
      .where({ id: suiteId })
      .first();
    expect(suite).toMatchObject({
      creator_id: user.id,
      group_id: "groupId",
      team_id: teams[0].id,
    });

    const runs = await db("runs").select("*").where({ suite_id: suite.id });
    expect(runs).toMatchObject([{ suite_id: suite.id, test_id: "testId" }]);

    await db("runs").del();
    await db("group_tests").del();
    await db("tests").del();
  });

  it("throws an error if team is not enabled", async () => {
    const testFn = async (): Promise<string> => {
      return createSuiteResolver(
        {},
        { group_id: "groupId" },
        { ...testContext, teams: [{ ...teams[0], is_enabled: false }] }
      );
    };

    await expect(testFn()).rejects.toThrowError(
      "team disabled, please contact support"
    );
  });

  it("throws an error if no tests exist for a team", async () => {
    const testFn = async (): Promise<string> => {
      return createSuiteResolver({}, { group_id: "groupId" }, testContext);
    };

    await expect(testFn()).rejects.toThrowError("tests to run");
  });
});

describe("suiteResolver", () => {
  beforeAll(async () => {
    return db("groups").insert(buildGroup({}));
  });

  afterAll(async () => {
    return db("groups").del();
  });

  it("returns a suite", async () => {
    jest.spyOn(suiteModel, "findSuite").mockResolvedValue(suites[0]);

    const suite = await suiteResolver({}, { id: "suiteId" }, testContext);

    expect(suite).toEqual(suites[0]);

    expect(suiteModel.findSuite).toBeCalledWith("suiteId", {
      logger: expect.any(Logger),
    });
  });

  it("throws an error if group deleted", async () => {
    await db("groups").update({ deleted_at: minutesFromNow() });

    jest.spyOn(suiteModel, "findSuite").mockResolvedValue(suites[0]);

    const testFn = async (): Promise<Suite> => {
      return suiteResolver({}, { id: "suiteId" }, testContext);
    };

    await expect(testFn()).rejects.toThrowError("not found");

    await db("groups").update({ deleted_at: null });
  });
});

describe("suitesResolver", () => {
  beforeAll(async () => {
    return db("groups").insert(buildGroup({}));
  });

  afterAll(async () => {
    return db("groups").del();
  });

  it("returns suites for a team", async () => {
    jest.spyOn(suiteModel, "findSuitesForGroup").mockResolvedValue(suites);

    const formattedSuites = await suitesResolver(
      { group_id: "groupId" },
      {},
      testContext
    );

    expect(formattedSuites).toMatchObject([
      {
        created_at: timestamp,
        group_name: "schedule",
        id: "suiteId",
        repeat_minutes: 60,
        team_id: "teamId",
      },
      {
        created_at: timestamp,
        group_name: "schedule",
        id: "suite2Id",
        repeat_minutes: 60,
        team_id: "teamId",
      },
    ]);

    expect(suiteModel.findSuitesForGroup).toBeCalledWith(
      {
        group_id: "groupId",
        limit: 50,
      },
      expect.any(Logger)
    );
  });
});
