import { reset as resetMockDate, set as setMockDate } from "mockdate";

import * as triggerModel from "../../../server/models/trigger";
import { Trigger } from "../../../server/types";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildEnvironment,
  buildIntegration,
  buildTeam,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const {
  createTrigger,
  deleteTrigger,
  findTrigger,
  findTriggerOrNull,
  findTriggersForGitHubIntegration,
  findTriggersForNetlifyIntegration,
  findTriggersForTeam,
  findPendingTriggers,
  getNextAt,
  updateTrigger,
} = triggerModel;

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
  await db("users").insert(buildUser({}));
  await db("integrations").insert([
    buildIntegration({}),
    buildIntegration({ i: 2, type: "github" }),
  ]);
  await db("environments").insert(buildEnvironment({}));
});

describe("trigger model", () => {
  afterEach(jest.restoreAllMocks);

  describe("createTrigger", () => {
    afterEach(() => db("triggers").del());

    it("creates a new trigger", async () => {
      await createTrigger(
        {
          creator_id: "userId",
          name: "Schedule (once an hour)",
          repeat_minutes: 60,
          team_id: "teamId",
        },
        options
      );

      const triggers = await db.select("*").from("triggers");

      expect(triggers).toMatchObject([
        {
          creator_id: "userId",
          deleted_at: null,
          deployment_integration_id: null,
          deployment_provider: null,
          environment_id: null,
          id: expect.any(String),
          name: "Schedule (once an hour)",
          next_at: expect.any(Date),
          repeat_minutes: 60,
          team_id: "teamId",
        },
      ]);
    });

    it("creates a new trigger for deployment", async () => {
      await createTrigger(
        {
          creator_id: "userId",
          deployment_branches: "develop, main",
          deployment_environment: "preview",
          deployment_integration_id: "integrationId",
          deployment_provider: "vercel",
          environment_id: "environmentId",
          name: "Deployment",
          repeat_minutes: 60,
          team_id: "teamId",
        },
        options
      );

      const triggers = await db.select("*").from("triggers");

      expect(triggers).toMatchObject([
        {
          creator_id: "userId",
          deleted_at: null,
          deployment_branches: "develop,main",
          deployment_environment: "preview",
          deployment_integration_id: "integrationId",
          deployment_provider: "vercel",
          environment_id: "environmentId",
          id: expect.any(String),
          name: "Deployment",
          repeat_minutes: 60,
        },
      ]);

      await createTrigger(
        {
          creator_id: "userId",
          deployment_branches: null,
          deployment_environment: "preview",
          deployment_integration_id: "integrationId",
          deployment_provider: "netlify",
          environment_id: "environmentId",
          name: "Deployment (Netlify)",
          repeat_minutes: 60,
          team_id: "teamId",
        },
        options
      );

      const trigger2 = await db
        .select("*")
        .from("triggers")
        .orderBy("created_at", "desc")
        .first();

      expect(trigger2).toMatchObject({
        deployment_branches: null,
        deployment_environment: "preview",
        deployment_integration_id: "integrationId",
        deployment_provider: "netlify",
        name: "Deployment (Netlify)",
      });
    });

    it("throws an error if trigger name taken", async () => {
      await db("triggers").insert(buildTrigger({}));

      await expect(
        (async (): Promise<Trigger> => {
          return createTrigger(
            {
              creator_id: "userId",
              name: "trigger1",
              repeat_minutes: 60,
              team_id: "teamId",
            },
            options
          );
        })()
      ).rejects.toThrowError("name must be unique");
    });
  });

  describe("deleteTrigger", () => {
    beforeAll(async () => {
      return db("triggers").insert(buildTrigger({}));
    });

    afterAll(() => db("triggers").del());

    it("deletes a trigger", async () => {
      const trigger = await deleteTrigger("triggerId", options);

      expect(trigger).toMatchObject({
        deleted_at: expect.any(String),
        id: "triggerId",
      });

      const dbTrigger = await db
        .select("*")
        .from("triggers")
        .where({ id: "triggerId" })
        .first();
      expect(dbTrigger.deleted_at).toBeTruthy();
    });
  });

  describe("findTrigger", () => {
    beforeAll(() => db("triggers").insert(buildTrigger({})));

    afterAll(() => db("triggers").del());

    it("finds a trigger", async () => {
      const trigger = await findTrigger("triggerId", options);

      expect(trigger).toMatchObject({ id: "triggerId" });
    });

    it("throws an error if trigger does not exist", async () => {
      await expect(findTrigger("fakeId", options)).rejects.toThrowError(
        "not found"
      );
    });

    it("throws an error if trigger is deleted", async () => {
      await db("triggers").update({ deleted_at: minutesFromNow() });

      await expect(findTrigger("triggerId", options)).rejects.toThrowError(
        "not found"
      );

      await db("triggers").update({ deleted_at: null });
    });
  });

  describe("findTriggerOrNull", () => {
    beforeAll(() => db("triggers").insert(buildTrigger({})));

    afterAll(() => db("triggers").del());

    it("finds a trigger", async () => {
      const trigger = await findTriggerOrNull("triggerId", options);

      expect(trigger).toMatchObject({ id: "triggerId" });
    });

    it("returns null if trigger not found", async () => {
      const trigger = await findTriggerOrNull("fakeId", options);

      expect(trigger).toBeNull();
    });
  });

  describe("findTriggersForGitHubIntegration", () => {
    beforeAll(async () => {
      await db("integrations").insert([
        buildIntegration({
          github_installation_id: 123,
          github_repo_id: 1,
          i: 3,
          type: "github",
        }),
        buildIntegration({
          github_installation_id: 123,
          github_repo_id: 2,
          i: 4,
          type: "github",
        }),
      ]);

      await db("triggers").insert([
        buildTrigger({ deployment_integration_id: "integration3Id" }),
        buildTrigger({ deployment_integration_id: "integration3Id", i: 2 }),
        buildTrigger({ deployment_integration_id: "integration4Id", i: 3 }),
        buildTrigger({ deployment_integration_id: null, i: 4 }),
      ]);

      return db("triggers")
        .where({ id: "trigger2Id" })
        .update({ deleted_at: new Date().toISOString() });
    });

    afterAll(async () => {
      await db("triggers").del();

      return db("integrations")
        .whereIn("id", ["integration3Id", "integration4Id"])
        .del();
    });

    it("returns triggers for a github integration", async () => {
      const triggers = await findTriggersForGitHubIntegration(1, options);

      expect(triggers).toMatchObject([
        { deployment_integration_id: "integration3Id", id: "triggerId" },
      ]);
    });
  });

  describe("findTriggersForNetlifyIntegration", () => {
    beforeAll(() => {
      return db("triggers").insert([
        buildTrigger({
          deployment_environment: "production",
          deployment_provider: "netlify",
          name: "A Trigger",
        }),
        {
          ...buildTrigger({
            deployment_provider: "netlify",
            name: "deleted",
          }),
          deleted_at: minutesFromNow(),
          id: "deletedTriggerId",
        },
        buildTrigger({
          deployment_provider: "netlify",
          i: 2,
          team_id: "team2Id",
        }),
        buildTrigger({
          deployment_environment: null,
          deployment_provider: "netlify",
          i: 3,
          name: "B Trigger",
        }),
        buildTrigger({
          deployment_environment: "preview",
          deployment_provider: "netlify",
          i: 4,
          name: "C Trigger",
        }),
      ]);
    });

    afterAll(() => db("triggers").del());

    it("returns triggers for a netlify integration", async () => {
      const triggers = await findTriggersForNetlifyIntegration(
        {
          deployment_environment: "production",
          team_id: "teamId",
        },
        options
      );

      expect(triggers).toMatchObject([
        { name: "A Trigger" },
        { name: "B Trigger" },
      ]);
    });
  });

  describe("findTriggersForTeam", () => {
    beforeAll(() => {
      return db("triggers").insert([
        buildTrigger({ name: "A Trigger" }),
        {
          ...buildTrigger({ name: "deleted" }),
          deleted_at: minutesFromNow(),
          id: "deletedTriggerId",
        },
        buildTrigger({ i: 2, team_id: "team2Id" }),
        buildTrigger({ i: 3, name: "B Trigger" }),
      ]);
    });

    afterAll(() => db("triggers").del());

    it("returns triggers for a team", async () => {
      const triggers = await findTriggersForTeam("teamId", options);

      expect(triggers).toMatchObject([
        { id: "triggerId", name: "A Trigger" },
        { id: "trigger3Id", name: "B Trigger" },
      ]);
    });
  });

  describe("findPendingTriggers", () => {
    beforeAll(async () => {
      await db("teams").where({ id: "team2Id" }).update({ is_enabled: false });

      return db("triggers").insert([
        buildTrigger({ next_at: new Date("2020-01-01").toISOString() }),
        buildTrigger({ i: 2, next_at: new Date("2100-01-01").toISOString() }),
        buildTrigger({ i: 3, next_at: null }),
        buildTrigger({ i: 4, next_at: new Date("2019-01-01").toISOString() }),
        {
          ...buildTrigger({
            i: 5,
            next_at: new Date("2019-01-01").toISOString(),
          }),
          deleted_at: minutesFromNow(),
        },
        buildTrigger({
          i: 6,
          next_at: new Date("2019-01-01").toISOString(),
          team_id: "team2Id",
        }),
        buildTrigger({
          i: 7,
          next_at: new Date("2020-01-01").toISOString(),
          team_id: "team2Id",
        }),
      ]);
    });

    afterAll(async () => {
      await db("teams").where({ id: "team2Id" }).update({ is_enabled: true });

      return db("triggers").del();
    });

    it("returns pending triggers", async () => {
      const triggers = await findPendingTriggers(options);

      expect(triggers).toMatchObject([
        { id: "trigger4Id" },
        { id: "triggerId" },
      ]);
    });
  });

  describe("getNextAt", () => {
    afterAll(() => resetMockDate());

    it("returns null if no repeat_minutes", () => {
      expect(getNextAt({ repeat_minutes: null })).toBeNull();
    });

    it("supports daily", () => {
      // defaults to 9am pacific
      setMockDate(new Date("2021-04-22T15:59:00.000Z"));
      // 8:59am should return 9am
      expect(getNextAt({ repeat_minutes: 60 * 24 })).toBe(
        "2021-04-22T16:00:00.000Z"
      );

      // 9am should return tomorrow 9am
      setMockDate(new Date("2021-04-22T16:00:00.000Z"));
      expect(getNextAt({ repeat_minutes: 60 * 24 })).toBe(
        "2021-04-23T16:00:00.000Z"
      );
    });

    it("supports daylight savings", () => {
      setMockDate(new Date("2021-03-12T17:00:00.000Z"));
      expect(getNextAt({ repeat_minutes: 60 * 24 })).toBe(
        "2021-03-13T17:00:00.000Z"
      );

      setMockDate(new Date("2021-03-13T17:00:00.000Z"));
      expect(getNextAt({ repeat_minutes: 60 * 24 })).toBe(
        "2021-03-14T16:00:00.000Z"
      );
    });

    it("supports minutely", () => {
      setMockDate(new Date("2021-03-15T13:00:00.000Z"));
      expect(getNextAt({ repeat_minutes: 90 })).toBe(
        "2021-03-15T14:30:00.000Z"
      );
    });

    it("supports hourly", () => {
      setMockDate(new Date("2021-03-15T13:00:00.000Z"));
      expect(getNextAt({ repeat_minutes: 60 })).toBe(
        "2021-03-15T14:00:00.000Z"
      );
    });

    it("supports other start times", () => {
      // Now is 5pm Pacific
      setMockDate(new Date("2021-03-15T00:00:00.000Z"));
      expect(
        // Daily at 8pm Pacific
        getNextAt({
          repeat_minutes: 60 * 24,
          start_at: new Date(Date.UTC(2021, 1, 1, 20)).toISOString(),
        })
      ).toBe("2021-03-15T03:00:00.000Z");
    });

    it("supports other timezones", () => {
      setMockDate(new Date("2021-03-15T13:00:00.000Z"));
      expect(
        getNextAt({ repeat_minutes: 60 * 24, timezone_id: "America/New_York" })
      ).toBe("2021-03-16T13:00:00.000Z");
    });
  });

  describe("updateTrigger", () => {
    beforeEach(async () => {
      return db("triggers").insert(buildTrigger({}));
    });

    afterEach(() => db("triggers").del());

    it("updates a trigger", async () => {
      const oldTrigger = await db.select("*").from("triggers").first();

      await updateTrigger(
        {
          deployment_integration_id: "integration2Id",
          id: "triggerId",
          name: "newName",
        },
        options
      );
      const updatedTrigger = await db.select("*").from("triggers").first();

      expect(updatedTrigger.deployment_integration_id).toBe("integration2Id");
      expect(updatedTrigger.name).toBe("newName");
      expect(oldTrigger.repeat_minutes).toBe(updatedTrigger.repeat_minutes);
      expect(oldTrigger.updated_at).not.toBe(updatedTrigger.updated_at);
    });

    it("updates trigger deployment settings", async () => {
      await updateTrigger(
        {
          deployment_branches: "main, develop",
          deployment_integration_id: "integration2Id",
          deployment_provider: "vercel",
          id: "triggerId",
        },
        options
      );
      const updatedTrigger = await db.select("*").from("triggers").first();

      expect(updatedTrigger.deployment_branches).toBe("main,develop");
      expect(updatedTrigger.deployment_environment).toBeNull();
      expect(updatedTrigger.deployment_provider).toBe("vercel");

      await updateTrigger(
        {
          deployment_branches: null,
          deployment_environment: "preview",
          deployment_integration_id: "integration2Id",
          deployment_provider: "netlify",
          id: "triggerId",
        },
        options
      );
      const updatedTrigger2 = await db.select("*").from("triggers").first();

      expect(updatedTrigger2.deployment_branches).toBeNull();
      expect(updatedTrigger2.deployment_environment).toBe("preview");
      expect(updatedTrigger2.deployment_provider).toBe("netlify");
    });

    it("updates trigger environment", async () => {
      await updateTrigger(
        {
          environment_id: "environmentId",
          id: "triggerId",
        },
        options
      );
      const updatedTrigger = await db.select("*").from("triggers").first();

      expect(updatedTrigger.environment_id).toBe("environmentId");

      await updateTrigger(
        {
          environment_id: null,
          id: "triggerId",
        },
        options
      );
      const updatedTrigger2 = await db.select("*").from("triggers").first();

      expect(updatedTrigger2.environment_id).toBeNull();
    });

    it("updates repeat_minutes", async () => {
      const oldTrigger = await db.select("*").from("triggers").first();

      await updateTrigger(
        { id: "triggerId", repeat_minutes: 24 * 60 },
        options
      );

      const updatedTrigger = await db.select("*").from("triggers").first();

      expect(updatedTrigger.repeat_minutes).toBe(24 * 60);
      expect(updatedTrigger.next_at).not.toBe(oldTrigger.next_at);
    });

    it("clears repeat_minutes", async () => {
      await updateTrigger({ id: "triggerId", repeat_minutes: null }, options);

      const updatedTrigger = await db.select("*").from("triggers").first();

      expect(updatedTrigger.repeat_minutes).toBeNull();
      expect(updatedTrigger.next_at).toBeNull();
    });

    it("throws an error if trigger name exists", async () => {
      const oldTrigger = await db.select("*").from("triggers").first();

      await db("triggers").insert(buildTrigger({ i: 2 }));

      await expect(
        updateTrigger({ id: "trigger2Id", name: oldTrigger.name }, options)
      ).rejects.toThrowError("trigger name must be unique");

      await db("triggers").where({ id: "trigger2Id" }).del();
    });

    it("throws an error if trigger id invalid", async () => {
      await expect(
        updateTrigger({ id: "fakeId", name: "name" }, options)
      ).rejects.toThrowError("not found");
    });
  });
});
