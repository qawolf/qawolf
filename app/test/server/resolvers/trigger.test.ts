import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  createTriggerResolver,
  deleteTriggerResolver,
  testTriggersResolver,
  triggersResolver,
  updateTriggerResolver,
} from "../../../server/resolvers/trigger";
import {
  buildEnvironment,
  buildIntegration,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
});

afterAll(() => dropTestDb());

const testContext = {
  api_key: null,
  ip: "127.0.0.1",
  logger,
  teams: [buildTeam({})],
  user: buildUser({}),
};

describe("createTriggerResolver", () => {
  afterAll(() => db("triggers").del());

  it("creates a new trigger", async () => {
    const trigger = await createTriggerResolver(
      {},
      { team_id: "teamId" },
      testContext
    );

    expect(trigger).toMatchObject({
      creator_id: "userId",
      name: "My Tests",
      repeat_minutes: null,
      team_id: "teamId",
    });
  });
});

describe("deleteTriggerResolver", () => {
  beforeAll(async () => {
    await db("triggers").insert([
      buildTrigger({}),
      buildTrigger({ i: 2, is_default: true }),
    ]);
    await db("tests").insert([buildTest({}), buildTest({ i: 2 })]);

    return db("test_triggers").insert([
      { id: "testTriggerId", test_id: "testId", trigger_id: "triggerId" },
      { id: "testTrigger2Id", test_id: "test2Id", trigger_id: "triggerId" },
      { id: "testTrigger3Id", test_id: "testId", trigger_id: "trigger2Id" },
    ]);
  });

  afterAll(async () => {
    await db("test_triggers").del();
    await db("triggers").del();
    return db("tests").del();
  });

  it("deletes a trigger and associated test triggers", async () => {
    const result = await deleteTriggerResolver(
      {},
      { id: "triggerId" },
      testContext
    );

    expect(result).toEqual({
      default_trigger_id: "trigger2Id",
      id: "triggerId",
    });

    const trigger = await db
      .select("*")
      .from("triggers")
      .where({ id: "triggerId" })
      .first();
    expect(trigger.deleted_at).toBeTruthy();

    const testTriggers = await db.select("*").from("test_triggers");
    expect(testTriggers).toMatchObject([{ id: "testTrigger3Id" }]);
  });
});

describe("triggersResolver", () => {
  beforeAll(() => {
    return db("triggers").insert([
      buildTrigger({}),
      buildTrigger({ i: 2 }),
      buildTrigger({ i: 3, team_id: "team2Id" }),
    ]);
  });

  afterAll(() => db("triggers").del());

  it("returns triggers for a team", async () => {
    const triggers = await triggersResolver(
      {},
      { team_id: "teamId" },
      testContext
    );

    expect(triggers).toMatchObject([{ id: "triggerId" }, { id: "trigger2Id" }]);
  });
});

describe("testTriggersResolver", () => {
  beforeAll(async () => {
    await db("triggers").insert([
      buildTrigger({ name: "A Trigger" }),
      buildTrigger({ i: 2, is_default: true, name: "All Tests" }),
      buildTrigger({ i: 3 }),
    ]);
    await db("tests").insert(buildTest({}));
    return db("test_triggers").insert([
      { id: "testTriggerId", test_id: "testId", trigger_id: "triggerId" },
      { id: "testTrigger2Id", test_id: "testId", trigger_id: "trigger2Id" },
    ]);
  });

  afterAll(async () => {
    await db("test_triggers").del();
    await db("triggers").del();
    return db("tests").del();
  });

  it("finds triggers for a test", async () => {
    const triggers = await testTriggersResolver(buildTest({}), {}, testContext);

    expect(triggers).toMatchObject([
      {
        name: "A Trigger",
      },
      { name: "All Tests" },
    ]);
  });
});

describe("updateTriggerResolver", () => {
  beforeAll(async () => {
    await db("environments").insert(buildEnvironment({}));
    await db("integrations").insert([
      buildIntegration({}),
      buildIntegration({ i: 2, type: "github" }),
    ]);
    return db("triggers").insert(buildTrigger({}));
  });

  afterAll(() => db("triggers").del());

  it("updates a trigger", async () => {
    const updateTrigger = await updateTriggerResolver(
      {},
      { id: "triggerId", name: "newName", repeat_minutes: 24 * 60 },
      testContext
    );

    expect(updateTrigger.name).toBe("newName");
    expect(updateTrigger.repeat_minutes).toBe(24 * 60);
  });

  it("updates alert preferences for trigger", async () => {
    const updateTrigger = await updateTriggerResolver(
      {},
      {
        id: "triggerId",
        is_email_enabled: false,
        alert_integration_id: "integrationId",
      },
      testContext
    );

    expect(updateTrigger).toMatchObject({
      is_email_enabled: false,
      alert_integration_id: "integrationId",
    });
  });

  it("updates deployment preferences for trigger", async () => {
    const updateTrigger = await updateTriggerResolver(
      {},
      {
        deployment_branches: "main",
        deployment_environment: "preview",
        deployment_integration_id: "integration2Id",
        id: "triggerId",
        repeat_minutes: null,
      },
      testContext
    );

    expect(updateTrigger).toMatchObject({
      deployment_branches: "main",
      deployment_environment: "preview",
      deployment_integration_id: "integration2Id",
      repeat_minutes: null,
    });
  });

  it("updates environment for trigger", async () => {
    const updateTrigger = await updateTriggerResolver(
      {},
      {
        environment_id: "environmentId",
        id: "triggerId",
        repeat_minutes: null,
      },
      testContext
    );

    expect(updateTrigger).toMatchObject({
      environment_id: "environmentId",
      repeat_minutes: null,
    });
  });
});
