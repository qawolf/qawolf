import { db, dropTestDb, migrateDb } from "../../../server/db";
import * as triggerModel from "../../../server/models/trigger";
import { Trigger } from "../../../server/types";
import { minutesFromNow } from "../../../shared/utils";
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
  findDefaultTriggerForTeam,
  findTrigger,
  findTriggersForGitHubIntegration,
  findTriggersForTeam,
  findPendingTriggers,
  getNextAt,
  getNextDay,
  getNextHour,
  getUpdatedNextAt,
  updateTrigger,
  updateTriggerNextAt,
} = triggerModel;

const mockDateConstructor = (dateString: string): void => {
  const mockDate = new Date(dateString);
  jest.spyOn(global, "Date").mockImplementation(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockDate as any;
  });
};

beforeAll(async () => {
  await migrateDb();

  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
  await db("users").insert(buildUser({}));
  await db("integrations").insert([
    buildIntegration({}),
    buildIntegration({ i: 2, type: "github" }),
  ]);
  await db("environments").insert(buildEnvironment({}));
});

afterAll(() => dropTestDb());

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
        { logger }
      );

      const triggers = await db.select("*").from("triggers");

      expect(triggers).toMatchObject([
        {
          creator_id: "userId",
          deleted_at: null,
          deployment_integration_id: null,
          environment_id: null,
          id: expect.any(String),
          is_default: false,
          name: "Schedule (once an hour)",
          next_at: expect.any(Date),
          repeat_minutes: 60,
          team_id: "teamId",
        },
      ]);
    });

    it("creates a new default trigger", async () => {
      await createTrigger(
        {
          creator_id: "userId",
          is_default: true,
          name: "All Tests",
          repeat_minutes: null,
          team_id: "teamId",
        },
        { logger }
      );

      const triggers = await db.select("*").from("triggers");

      expect(triggers).toMatchObject([
        {
          creator_id: "userId",
          deployment_branches: null,
          deployment_environment: null,
          deployment_integration_id: null,
          id: expect.any(String),
          is_default: true,
          name: "All Tests",
          next_at: null,
          repeat_minutes: null,
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
          environment_id: "environmentId",
          name: "Hourly (Staging)",
          repeat_minutes: 60,
          team_id: "teamId",
        },
        { logger }
      );

      const triggers = await db.select("*").from("triggers");

      expect(triggers).toMatchObject([
        {
          creator_id: "userId",
          deleted_at: null,
          deployment_branches: "develop,main",
          deployment_environment: "preview",
          deployment_integration_id: "integrationId",
          environment_id: "environmentId",
          id: expect.any(String),
          is_default: false,
          name: "Hourly (Staging)",
          repeat_minutes: 60,
        },
      ]);
    });
  });

  describe("deleteTrigger", () => {
    beforeAll(async () => {
      return db("triggers").insert([
        buildTrigger({}),
        buildTrigger({ i: 2, is_default: true }),
      ]);
    });

    afterAll(() => db("triggers").del());

    it("deletes a trigger", async () => {
      const trigger = await deleteTrigger("triggerId", { logger });

      expect(trigger).toMatchObject({
        deleted_at: expect.any(String),
        id: "triggerId",
        is_default: false,
      });

      const dbTrigger = await db
        .select("*")
        .from("triggers")
        .where({ id: "triggerId" })
        .first();
      expect(dbTrigger.deleted_at).toBeTruthy();
    });

    it("throws an error if trigger is default", async () => {
      const testFn = async (): Promise<Trigger> => {
        return deleteTrigger("trigger2Id", { logger });
      };

      await expect(testFn()).rejects.toThrowError("cannot delete");
    });
  });

  describe("findDefaultTriggerForTeam", () => {
    beforeAll(async () => {
      await db("teams").insert(buildTeam({ i: 3 }));
      return db("triggers").insert([
        buildTrigger({
          is_default: true,
          name: "All Tests",
          team_id: "team3Id",
        }),
        buildTrigger({ i: 2, is_default: false, team_id: "team3Id" }),
      ]);
    });

    afterAll(async () => {
      await db("triggers").del();
      return db("teams").where({ id: "team3Id" }).del();
    });

    it("finds the default trigger for a team", async () => {
      const trigger = await findDefaultTriggerForTeam("team3Id", { logger });
      expect(trigger).toMatchObject({ is_default: true, name: "All Tests" });
    });

    it("throws an error if a team has no default trigger", async () => {
      await db("triggers").where({ is_default: true }).del();

      const testFn = async (): Promise<Trigger> => {
        return findDefaultTriggerForTeam("team3Id", { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");

      await db("triggers").insert(
        buildTrigger({
          is_default: true,
          name: "All Tests",
          team_id: "team3Id",
        })
      );
    });
  });

  describe("findTrigger", () => {
    beforeAll(() => db("triggers").insert(buildTrigger({})));

    afterAll(() => db("triggers").del());

    it("finds a trigger", async () => {
      const trigger = await findTrigger("triggerId", { logger });

      expect(trigger).toMatchObject({ id: "triggerId" });
    });

    it("throws an error if trigger does not exist", async () => {
      const testFn = async (): Promise<Trigger> => {
        return findTrigger("fakeId", { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");
    });

    it("throws an error if trigger is deleted", async () => {
      await db("triggers").update({ deleted_at: minutesFromNow() });

      const testFn = async (): Promise<Trigger> => {
        return findTrigger("triggerId", { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");

      await db("triggers").update({ deleted_at: null });
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
      const triggers = await findTriggersForGitHubIntegration(1, { logger });

      expect(triggers).toMatchObject([
        { deployment_integration_id: "integration3Id", id: "triggerId" },
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
        buildTrigger({ i: 2, is_default: true, name: "All Tests" }),
        buildTrigger({ i: 3, team_id: "team2Id" }),
        buildTrigger({ i: 4, name: "B Trigger" }),
      ]);
    });

    afterAll(() => db("triggers").del());

    it("returns triggers for a team", async () => {
      const triggers = await findTriggersForTeam("teamId", { logger });

      expect(triggers).toMatchObject([
        { id: "trigger2Id", name: "All Tests" },
        { id: "triggerId", name: "A Trigger" },
        { id: "trigger4Id", name: "B Trigger" },
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
      const triggers = await findPendingTriggers({ logger });

      expect(triggers).toMatchObject([
        { id: "trigger4Id" },
        { id: "triggerId" },
      ]);
    });
  });

  describe("getNextAt", () => {
    it("returns null if no repeat_minutes", () => {
      expect(getNextAt(null)).toBeNull();
    });

    it("returns next hour if applicable", () => {
      mockDateConstructor("2020-06-23T14:04:53.643Z");
      expect(getNextAt(60)).toBe("2020-06-23T15:00:00.000Z");
    });

    it("returns next day if applicable", () => {
      mockDateConstructor("2020-06-23T16:04:53.643Z");
      expect(getNextAt(24 * 60)).toBe("2020-06-24T16:00:00.000Z");
    });

    it("throws an error if unsupported interval", () => {
      const testFn = (): string | null => getNextAt(160);
      expect(testFn).toThrowError("Cannot get next_at");
    });
  });

  describe("getNextDay", () => {
    it("returns the next day if daily run time has passed", () => {
      mockDateConstructor("2020-06-23T20:04:53.643Z");
      expect(getNextDay()).toBe("2020-06-24T16:00:00.000Z");
    });

    it("returns the current day otherwise", () => {
      mockDateConstructor("2020-06-23T01:04:53.643Z");
      expect(getNextDay()).toBe("2020-06-23T16:00:00.000Z");
    });
  });

  describe("getNextHour", () => {
    it("returns the next hour mark", () => {
      mockDateConstructor("2020-06-23T20:04:53.643Z");
      expect(getNextHour()).toBe("2020-06-23T21:00:00.000Z");
    });

    it("handles changing days", () => {
      mockDateConstructor("2020-06-23T23:04:53.643Z");
      expect(getNextHour()).toBe("2020-06-24T00:00:00.000Z");
    });
  });

  describe("getUpdatedNextAt", () => {
    it("returns null if no next_at or repeat_minutes", () => {
      expect(getUpdatedNextAt({ next_at: null } as Trigger)).toBeNull();
      expect(
        getUpdatedNextAt({
          next_at: minutesFromNow(),
          repeat_minutes: null,
        } as Trigger)
      ).toBeNull();
    });

    it("increments next_at by repeat_minutes", () => {
      expect(
        getUpdatedNextAt({
          next_at: "2050-06-24T01:00:00.000Z",
          repeat_minutes: 60,
        } as Trigger)
      ).toBe("2050-06-24T02:00:00.000Z");
    });

    it("resets next_at if applicable", () => {
      const next_at = getUpdatedNextAt({
        next_at: "2019-06-24T01:00:00.000Z",
        repeat_minutes: 60,
      } as Trigger);

      expect(new Date(next_at as string).getFullYear()).toBe(
        new Date().getFullYear()
      );
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
        { logger }
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
          id: "triggerId",
        },
        { logger }
      );
      const updatedTrigger = await db.select("*").from("triggers").first();

      expect(updatedTrigger.deployment_branches).toBe("main,develop");
      expect(updatedTrigger.deployment_environment).toBeNull();

      await updateTrigger(
        {
          deployment_branches: null,
          deployment_environment: "preview",
          deployment_integration_id: "integration2Id",
          id: "triggerId",
        },
        { logger }
      );
      const updatedTrigger2 = await db.select("*").from("triggers").first();

      expect(updatedTrigger2.deployment_branches).toBeNull();
      expect(updatedTrigger2.deployment_environment).toBe("preview");
    });

    it("updates trigger environment", async () => {
      await updateTrigger(
        {
          environment_id: "environmentId",
          id: "triggerId",
        },
        { logger }
      );
      const updatedTrigger = await db.select("*").from("triggers").first();

      expect(updatedTrigger.environment_id).toBe("environmentId");

      await updateTrigger(
        {
          environment_id: null,
          id: "triggerId",
        },
        { logger }
      );
      const updatedTrigger2 = await db.select("*").from("triggers").first();

      expect(updatedTrigger2.environment_id).toBeNull();
    });

    it("updates repeat_minutes", async () => {
      const oldTrigger = await db.select("*").from("triggers").first();

      await updateTrigger(
        { id: "triggerId", repeat_minutes: 24 * 60 },
        { logger }
      );

      const updatedTrigger = await db.select("*").from("triggers").first();

      expect(updatedTrigger.repeat_minutes).toBe(24 * 60);
      expect(updatedTrigger.next_at).not.toBe(oldTrigger.next_at);
    });

    it("clears repeat_minutes", async () => {
      await updateTrigger(
        { id: "triggerId", repeat_minutes: null },
        { logger }
      );

      const updatedTrigger = await db.select("*").from("triggers").first();

      expect(updatedTrigger.repeat_minutes).toBeNull();
      expect(updatedTrigger.next_at).toBeNull();
    });

    it("throws an error if trigger name exists", async () => {
      const oldTrigger = await db.select("*").from("triggers").first();

      await db("triggers").insert(buildTrigger({ i: 2 }));

      const testFn = async (): Promise<Trigger> =>
        updateTrigger({ id: "trigger2Id", name: oldTrigger.name }, { logger });

      await expect(testFn()).rejects.toThrowError(
        "trigger name must be unique"
      );

      await db("triggers").where({ id: "trigger2Id" }).del();
    });

    it("throws an error if trigger id invalid", async () => {
      const testFn = async (): Promise<Trigger> => {
        return updateTrigger({ id: "fakeId", name: "name" }, { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");
    });

    it("throws an error if trying to rename default trigger", async () => {
      await db("triggers")
        .where({ id: "triggerId" })
        .update({ is_default: true });

      const testFn = async (): Promise<Trigger> => {
        return updateTrigger({ id: "triggerId", name: "newName" }, { logger });
      };

      await expect(testFn()).rejects.toThrowError("default trigger");

      await db("triggers")
        .where({ id: "triggerId" })
        .update({ is_default: false });
    });
  });

  describe("updateTriggerNextAt", () => {
    beforeAll(() => {
      return db("triggers").insert(
        buildTrigger({
          next_at: new Date("2050-06-24T00:00:00.000Z").toISOString(),
        })
      );
    });

    afterAll(() => db("triggers").del());

    it("updates next_at timestamp of a trigger", async () => {
      const updateTrigger = await db.transaction(async (trx) => {
        const trigger = await trx.select("*").from("triggers").first();
        await updateTriggerNextAt(trigger, { logger, trx });

        return trx.select("*").from("triggers").first();
      });

      expect(updateTrigger).toMatchObject({
        id: "triggerId",
        next_at: new Date("2050-06-24T01:00:00.000Z"),
      });
    });
  });
});
