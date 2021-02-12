import { db, dropTestDb, migrateDb } from "../../../server/db";
import { decrypt, encrypt } from "../../../server/models/encrypt";
import {
  createFreeTeamWithTrigger,
  findTeam,
  findTeamsForUser,
  updateTeam,
  validateApiKeyForTeam,
} from "../../../server/models/team";
import { Team } from "../../../server/types";
import { minutesFromNow } from "../../../shared/utils";
import {
  buildIntegration,
  buildTeam,
  buildTeamUser,
  buildUser,
  logger,
} from "../utils";

beforeAll(async () => {
  await migrateDb();

  return db("users").insert(buildUser({}));
});

afterAll(() => dropTestDb());

describe("team model", () => {
  describe("createFreeTeamWithTrigger", () => {
    afterAll(async () => {
      await db("environments").del();
      await db("triggers").del();
      return db("teams").del();
    });

    it("creates a free team with the default trigger and environments", async () => {
      await createFreeTeamWithTrigger("userId", { logger });

      const teams = await db.select("*").from("teams");
      expect(teams).toMatchObject([
        {
          alert_integration_id: null,
          api_key: expect.any(String),
          helpers: "",
          id: expect.any(String),
          is_email_alert_enabled: true,
          is_enabled: true,
          name: "My Team",
          next_trigger_id: expect.any(String),
          plan: "free",
          renewed_at: null,
          stripe_customer_id: null,
          stripe_subscription_id: null,
        },
      ]);

      expect(decrypt(teams[0].api_key)).toMatch("qawolf_");

      const triggers = await db.select("*").from("triggers");
      expect(triggers).toMatchObject([
        {
          creator_id: "userId",
          id: expect.any(String),
          is_default: true,
          name: "All Tests",
          repeat_minutes: null,
          team_id: teams[0].id,
        },
      ]);

      const environments = await db
        .select("*")
        .from("environments")
        .orderBy("name", "asc");
      expect(environments).toMatchObject([
        { name: "Production", team_id: teams[0].id },
        { name: "Staging", team_id: teams[0].id },
      ]);
    });
  });

  describe("findTeam", () => {
    beforeAll(async () => {
      return db("teams").insert(buildTeam({}));
    });

    afterAll(() => db("teams").del());

    it("finds a team", async () => {
      const team = await findTeam("teamId", { logger });
      expect(team).toMatchObject({ id: "teamId" });
    });

    it("throws an error if team not found", async () => {
      const testFn = async (): Promise<Team> => {
        return findTeam("fakeId", { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");
    });
  });

  describe("findTeamsForUser", () => {
    beforeAll(async () => {
      await db("teams").insert([
        buildTeam({}),
        buildTeam({ i: 2, name: "Another Team" }),
      ]);

      return db("team_users").insert([
        buildTeamUser({}),
        buildTeamUser({ i: 2, team_id: "team2Id" }),
      ]);
    });

    afterAll(async () => {
      await db("team_users").del();
      return db("teams").del();
    });

    it("returns teams for user", async () => {
      const teams = await findTeamsForUser("userId", { logger });

      expect(teams).toMatchObject([
        {
          id: "team2Id",
          name: "Another Team",
          plan: "free",
          renewed_at: null,
        },
        {
          id: "teamId",
          plan: "free",
          renewed_at: null,
        },
      ]);
    });

    it("returns null if no teams found", async () => {
      const teams = await findTeamsForUser("fakeId", { logger });

      expect(teams).toBeNull();
    });
  });

  describe("updateTeam", () => {
    beforeAll(async () => {
      await db("teams").insert(buildTeam({}));
      return db("integrations").insert(buildIntegration({}));
    });

    afterAll(async () => {
      await db("integrations").del();
      return db("teams").del();
    });

    it("updates team alert settings", async () => {
      const team = await updateTeam(
        {
          alert_integration_id: "integrationId",
          id: "teamId",
          is_email_alert_enabled: false,
        },
        { logger }
      );

      const updatedTeam = await db.select("*").from("teams").first();

      expect(team.alert_integration_id).toBe("integrationId");
      expect(team.is_email_alert_enabled).toBe(false);
      expect(team).toEqual({
        ...updatedTeam,
        updated_at: (updatedTeam.updated_at as Date).toISOString(),
      });

      const team2 = await updateTeam(
        {
          alert_integration_id: null,
          id: "teamId",
          is_email_alert_enabled: true,
        },
        { logger }
      );

      const updatedTeam2 = await db.select("*").from("teams").first();

      expect(team2.alert_integration_id).toBeNull();
      expect(team2.is_email_alert_enabled).toBe(true);
      expect(team2).toEqual({
        ...updatedTeam2,
        updated_at: (updatedTeam2.updated_at as Date).toISOString(),
      });
    });

    it("updates a team helpers", async () => {
      const team = await updateTeam(
        { helpers: "helpers", id: "teamId" },
        { logger }
      );

      const updatedTeam = await db.select("*").from("teams").first();

      expect(team.helpers).toBe("helpers");
      expect(team).toEqual({
        ...updatedTeam,
        updated_at: (updatedTeam.updated_at as Date).toISOString(),
      });
    });

    it("updates a team name", async () => {
      const team = await updateTeam(
        { id: "teamId", name: "new name" },
        { logger }
      );

      const updatedTeam = await db.select("*").from("teams").first();

      expect(team.name).toBe("new name");
      expect(team).toEqual({
        ...updatedTeam,
        updated_at: (updatedTeam.updated_at as Date).toISOString(),
      });
    });

    it("updates a team enabled", async () => {
      const team = await updateTeam(
        { id: "teamId", is_enabled: false },
        { logger }
      );

      const updatedTeam = await db.select("*").from("teams").first();

      expect(team.is_enabled).toBe(false);
      expect(team).toEqual({
        ...updatedTeam,
        updated_at: (updatedTeam.updated_at as Date).toISOString(),
      });
    });

    it("updates Stripe data for a team", async () => {
      const renewed_at = minutesFromNow();

      const team = await updateTeam(
        {
          id: "teamId",
          is_enabled: true,
          plan: "business",
          renewed_at,
          stripe_customer_id: "stripeCustomerId",
          stripe_subscription_id: "stripeSubscriptionId",
        },
        { logger }
      );

      const updatedTeam = await db.select("*").from("teams").first();
      expect(updatedTeam).toEqual({
        ...team,
        is_enabled: true,
        plan: "business",
        renewed_at: new Date(renewed_at),
        stripe_customer_id: "stripeCustomerId",
        stripe_subscription_id: "stripeSubscriptionId",
        updated_at: expect.anything(),
      });
    });

    it("updates next trigger id for a team", async () => {
      const team = await updateTeam(
        { id: "teamId", next_trigger_id: "nextTriggerId" },
        { logger }
      );

      const updatedTeam = await db.select("*").from("teams").first();
      expect(updatedTeam).toEqual({
        ...team,
        next_trigger_id: "nextTriggerId",
        updated_at: expect.anything(),
      });
    });

    it("throws an error if team not found", async () => {
      const testFn = async (): Promise<Team> => {
        return updateTeam({ id: "fakeId", name: "name" }, { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");
    });
  });

  describe("validateApiKeyForTeam", () => {
    beforeAll(async () => {
      await db("teams").insert(buildTeam({}));
      return db("teams")
        .where({ id: "teamId" })
        .update({ api_key: encrypt("qawolf_api_key") });
    });

    afterAll(() => db("teams").del());

    it("throws an error if api key is invalid", async () => {
      const testFn = async (): Promise<void> => {
        return validateApiKeyForTeam(
          { api_key: "invalidApiKey", team_id: "teamId" },
          { logger }
        );
      };

      await expect(testFn()).rejects.toThrowError("invalid api key");
    });

    it("does not throw an error if api key is valid", async () => {
      const testFn = async (): Promise<void> => {
        return validateApiKeyForTeam(
          { api_key: "qawolf_api_key", team_id: "teamId" },
          { logger }
        );
      };

      await expect(testFn()).resolves.not.toThrowError();
    });
  });
});
