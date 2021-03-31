import {
  createTriggerResolver,
  deleteTriggerResolver,
  triggersResolver,
  updateTriggerResolver,
} from "../../../server/resolvers/trigger";
import { prepareTestDb } from "../db";
import {
  buildEnvironment,
  buildIntegration,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  testContext,
} from "../utils";

const db = prepareTestDb();
const team = testContext.teams[0];
const context = { ...testContext, db };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert([team, buildTeam({ i: 2 })]);
  await db("environments").insert(buildEnvironment({}));
});

describe("createTriggerResolver", () => {
  beforeAll(() => db("tests").insert(buildTest({})));

  afterEach(async () => {
    await db("test_triggers").del();
    return db("triggers").del();
  });

  afterAll(() => db("tests").del());

  it("creates a new trigger with team next trigger id", async () => {
    const trigger = await createTriggerResolver(
      {},
      {
        deployment_branches: null,
        deployment_environment: null,
        deployment_integration_id: null,
        deployment_provider: null,
        environment_id: "environmentId",
        name: "Daily",
        repeat_minutes: 1440,
        team_id: "teamId",
        test_ids: null,
      },
      context
    );

    expect(trigger).toMatchObject({
      creator_id: "userId",
      deployment_branches: null,
      deployment_environment: null,
      deployment_integration_id: null,
      deployment_provider: null,
      environment_id: "environmentId",
      id: team.next_trigger_id,
      name: "Daily",
      repeat_minutes: 1440,
      team_id: "teamId",
    });

    const testTriggers = await db("test_triggers").select("*");

    expect(testTriggers).toEqual([]);

    const updatedTeam = await db("teams")
      .select("*")
      .where({ id: "teamId" })
      .first();

    expect(updatedTeam.next_trigger_id).not.toBe(team.next_trigger_id);
  });

  it("creates test triggers if specified", async () => {
    const trigger = await createTriggerResolver(
      {},
      {
        deployment_branches: null,
        deployment_environment: null,
        deployment_integration_id: null,
        deployment_provider: null,
        environment_id: "environmentId",
        name: "Daily",
        repeat_minutes: 1440,
        team_id: "teamId",
        test_ids: ["testId"],
      },
      context
    );

    const testTriggers = await db("test_triggers").select("*");

    expect(testTriggers).toMatchObject([
      { test_id: "testId", trigger_id: trigger.id },
    ]);
  });
});

describe("deleteTriggerResolver", () => {
  beforeAll(async () => {
    await db("triggers").insert([buildTrigger({}), buildTrigger({ i: 2 })]);
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
    const trigger = await deleteTriggerResolver(
      {},
      { id: "triggerId" },
      context
    );

    expect(trigger).toMatchObject({ id: "triggerId" });

    const dbTrigger = await db
      .select("*")
      .from("triggers")
      .where({ id: "triggerId" })
      .first();
    expect(dbTrigger.deleted_at).toBeTruthy();

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
    const triggers = await triggersResolver({}, { team_id: "teamId" }, context);

    expect(triggers).toMatchObject([{ id: "triggerId" }, { id: "trigger2Id" }]);
  });
});

describe("updateTriggerResolver", () => {
  beforeAll(async () => {
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
      context
    );

    expect(updateTrigger.name).toBe("newName");
    expect(updateTrigger.repeat_minutes).toBe(24 * 60);
  });

  it("updates deployment preferences for trigger", async () => {
    const updateTrigger = await updateTriggerResolver(
      {},
      {
        deployment_branches: "main",
        deployment_environment: "preview",
        deployment_integration_id: "integration2Id",
        deployment_provider: "vercel",
        id: "triggerId",
        repeat_minutes: null,
      },
      context
    );

    expect(updateTrigger).toMatchObject({
      deployment_branches: "main",
      deployment_environment: "preview",
      deployment_integration_id: "integration2Id",
      deployment_provider: "vercel",
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
      context
    );

    expect(updateTrigger).toMatchObject({
      environment_id: "environmentId",
      repeat_minutes: null,
    });
  });
});
