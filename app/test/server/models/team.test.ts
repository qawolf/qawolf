import { decrypt, encrypt } from "../../../server/models/encrypt";
import {
  createDefaultTeam,
  findTeam,
  findTeamForEmail,
  findTeamsForUser,
  updateTeam,
  validateApiKeyForTeam,
} from "../../../server/models/team";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildIntegration,
  buildTeam,
  buildTeamUser,
  buildUser,
  logger,
} from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(() => db("users").insert(buildUser({})));

describe("team model", () => {
  describe("createDefaultTeam", () => {
    afterAll(() => db("teams").del());

    it("creates a free team", async () => {
      await createDefaultTeam(options);

      const teams = await db.select("*").from("teams");
      expect(teams).toMatchObject([
        {
          alert_integration_id: null,
          api_key: expect.any(String),
          helpers: "",
          helpers_version: 0,
          id: expect.any(String),
          inbox: expect.any(String),
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
    });
  });

  describe("findTeam", () => {
    beforeAll(async () => {
      return db("teams").insert(buildTeam({}));
    });

    afterAll(() => db("teams").del());

    it("finds a team", async () => {
      const team = await findTeam("teamId", options);

      expect(team).toMatchObject({ id: "teamId" });
      expect(team.api_key).toMatch("qawolf_");
    });

    it("throws an error if team not found", async () => {
      await expect(findTeam("fakeId", options)).rejects.toThrowError(
        "not found"
      );
    });
  });

  describe("findTeamForEmail", () => {
    beforeAll(async () => {
      return db("teams").insert(
        buildTeam({ inbox: "pumpkin@dev.qawolf.email" })
      );
    });

    afterAll(() => db("teams").del());

    it("returns team for email", async () => {
      const team = await findTeamForEmail("pumpkin@dev.qawolf.email", options);

      expect(team).toMatchObject({ id: "teamId" });

      const team2 = await findTeamForEmail(
        "pumpkin+abc@dev.qawolf.email",
        options
      );

      expect(team2).toMatchObject({ id: "teamId" });

      const team3 = await findTeamForEmail(
        "pumpkin+1@dev.qawolf.email",
        options
      );

      expect(team3).toMatchObject({ id: "teamId" });
    });

    it("returns null if team not found", async () => {
      const team = await findTeamForEmail("logan@dev.qawolf.email", options);

      expect(team).toBeNull();
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
      const teams = await findTeamsForUser("userId", options);

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

      expect(teams[0].api_key).toMatch("qawolf_");
      expect(teams[1].api_key).toMatch("qawolf_");
    });

    it("returns null if no teams found", async () => {
      const teams = await findTeamsForUser("fakeId", options);

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
        options
      );

      const updatedTeam = await db.select("*").from("teams").first();

      expect(team.alert_integration_id).toBe("integrationId");
      expect(team.api_key).toMatch("qawolf_");
      expect(team.is_email_alert_enabled).toBe(false);
      expect(team).toEqual({
        ...updatedTeam,
        api_key: expect.any(String),
        updated_at: (updatedTeam.updated_at as Date).toISOString(),
      });

      const team2 = await updateTeam(
        {
          alert_integration_id: null,
          id: "teamId",
          is_email_alert_enabled: true,
        },
        options
      );

      const updatedTeam2 = await db.select("*").from("teams").first();

      expect(team2.alert_integration_id).toBeNull();
      expect(team2.api_key).toMatch("qawolf_");
      expect(team2.is_email_alert_enabled).toBe(true);
      expect(team2).toEqual({
        ...updatedTeam2,
        api_key: expect.any(String),
        updated_at: (updatedTeam2.updated_at as Date).toISOString(),
      });
    });

    it("updates a team helpers", async () => {
      const team = await updateTeam(
        { helpers: "helpers", helpers_version: 1, id: "teamId" },
        options
      );

      const updatedTeam = await db.select("*").from("teams").first();

      expect(team.api_key).toMatch("qawolf_");
      expect(team.helpers).toBe("helpers");
      expect(team.helpers_version).toBe(1);
      expect(team).toEqual({
        ...updatedTeam,
        api_key: expect.any(String),
        updated_at: (updatedTeam.updated_at as Date).toISOString(),
      });

      await db("teams")
        .where({ id: "teamId" })
        .update({ helpers: "", helpers_version: 0, id: "teamId" });
    });

    it("does not update team if helpers out of date", async () => {
      await db("teams").where({ id: "teamId" }).update({ helpers_version: 10 });

      const team = await updateTeam(
        { helpers: "helpers", helpers_version: 1, id: "teamId" },
        options
      );

      expect(team.helpers).not.toBe("helpers");

      const updatedTeam = await db.select("*").from("teams").first();

      expect(updatedTeam.helpers).toBe("");
      expect(updatedTeam.helpers_version).toBe(10);
    });

    it("updates a team name", async () => {
      const team = await updateTeam(
        { id: "teamId", name: "new name" },
        options
      );

      const updatedTeam = await db.select("*").from("teams").first();

      expect(team.api_key).toMatch("qawolf_");
      expect(team.name).toBe("new name");
      expect(team).toEqual({
        ...updatedTeam,
        api_key: expect.any(String),
        updated_at: (updatedTeam.updated_at as Date).toISOString(),
      });
    });

    it("updates a team enabled", async () => {
      const team = await updateTeam(
        { id: "teamId", is_enabled: false },
        options
      );

      const updatedTeam = await db.select("*").from("teams").first();

      expect(team.is_enabled).toBe(false);
      expect(team).toEqual({
        ...updatedTeam,
        api_key: expect.any(String),
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
        options
      );

      const updatedTeam = await db.select("*").from("teams").first();
      expect(updatedTeam).toEqual({
        ...team,
        api_key: expect.any(String),
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
        options
      );

      const updatedTeam = await db.select("*").from("teams").first();
      expect(updatedTeam).toEqual({
        ...team,
        api_key: expect.any(String),
        next_trigger_id: "nextTriggerId",
        updated_at: expect.anything(),
      });
    });

    it("throws an error if team not found", async () => {
      await expect(
        updateTeam({ id: "fakeId", name: "name" }, options)
      ).rejects.toThrowError("not found");
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
      await expect(
        validateApiKeyForTeam(
          { api_key: "invalidApiKey", team_id: "teamId" },
          options
        )
      ).rejects.toThrowError("invalid api key");
    });

    it("does not throw an error if api key is valid", async () => {
      await expect(
        validateApiKeyForTeam(
          { api_key: "qawolf_api_key", team_id: "teamId" },
          options
        )
      ).resolves.not.toThrowError();
    });
  });
});
