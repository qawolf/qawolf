import {
  createInvite,
  deleteInvite,
  findInvite,
  findInvitesForTeam,
  hasInvitedUser,
  updateInvite,
} from "../../../server/models/invite";
import { WOLF_NAMES, WOLF_VARIANTS } from "../../../server/models/wolfOptions";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildInvite,
  buildTeam,
  buildTeamUser,
  buildUser,
  logger,
} from "../utils";

const team = buildTeam({});
const user = buildUser({});
const user2 = buildUser({ i: 2 });

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("teams").insert([team, buildTeam({ i: 2 })]);
  await db("users").insert([user, user2]);
});

describe("invite model", () => {
  describe("createInvite", () => {
    beforeAll(async () => {
      await db("team_users").insert(buildTeamUser({}));

      return db("invites").insert([
        buildInvite({}),
        buildInvite({
          email: "rocky@qawolf.com",
          expires_at: new Date("2000").toISOString(),
          i: 2,
        }),
      ]);
    });

    afterAll(async () => {
      await db("team_users").del();
      await db("invites").del();
    });

    it("returns existing invite if possible", async () => {
      const invite = await createInvite(
        { creator_id: "userId", email: "spirit@qawolf.com", team_id: "teamId" },
        options
      );

      expect(invite).toMatchObject({ email: "spirit@qawolf.com" });

      const invites = await db.select("*").from("invites");
      expect(invites).toHaveLength(2);
    });

    it("creates a new invite", async () => {
      await createInvite(
        {
          creator_id: "userId",
          email: "glacier@qawolf.com",
          team_id: "teamId",
        },
        options
      );

      const invites = await db
        .select("*")
        .from("invites")
        .where({ email: "glacier@qawolf.com" });

      expect(invites).toHaveLength(1);
      expect(invites[0]).toMatchObject({
        accepted_at: null,
        creator_id: "userId",
        email: "glacier@qawolf.com",
        team_id: "teamId",
      });
      expect(WOLF_NAMES).toContain(invites[0].wolf_name);
      expect(WOLF_VARIANTS).toContain(invites[0].wolf_variant);
    });

    it("creates a new invite if existing invite expired", async () => {
      await createInvite(
        { creator_id: "userId", email: "rocky@qawolf.com", team_id: "teamId" },
        options
      );

      const invites = await db
        .select("*")
        .from("invites")
        .where({ email: "rocky@qawolf.com" })
        .orderBy("expires_at", "desc");

      expect(invites).toHaveLength(2);

      const expiresInFuture = invites[0].expires_at > new Date();
      expect(expiresInFuture).toBe(true);
    });

    it("creates a new invite for existing user", async () => {
      await createInvite(
        {
          creator_id: "userId",
          email: user2.email,
          team_id: "teamId",
        },
        options
      );

      const invites = await db
        .select("*")
        .from("invites")
        .where({ email: user2.email });

      expect(invites).toHaveLength(1);
      expect(invites[0]).toMatchObject({
        wolf_name: user2.wolf_name,
        wolf_number: user2.wolf_number,
        wolf_variant: user2.wolf_variant,
      });
    });

    it("throws an error if user already on team", async () => {
      await expect(
        createInvite(
          { creator_id: "userId", email: user.email, team_id: "teamId" },
          options
        )
      ).rejects.toThrowError("already on team");
    });
  });

  describe("deleteInvite", () => {
    beforeAll(() => {
      return db("invites").insert(buildInvite({}));
    });

    afterAll(() => db("invites").del());

    it("deletes an invite", async () => {
      const invites = await db.select("*").from("invites");
      expect(invites).toMatchObject([{ id: "inviteId" }]);

      await deleteInvite("inviteId", options);

      const invites2 = await db.select("*").from("invites");
      expect(invites2).toEqual([]);
    });
  });

  describe("findInvite", () => {
    beforeAll(() => {
      return db("invites").insert(buildInvite({}));
    });

    afterAll(() => db("invites").del());

    it("finds an invite", async () => {
      const invite = await findInvite("inviteId", options);

      expect(invite).toMatchObject({
        creator_email: user.email,
        id: "inviteId",
        team_name: team.name,
      });
    });

    it("throws an error if invite not found", async () => {
      await expect(findInvite("fakeId", options)).rejects.toThrowError(
        "not found"
      );
    });
  });

  describe("findInvitesForTeam", () => {
    beforeAll(() => {
      return db("invites").insert([
        buildInvite({}),
        buildInvite({
          email: "rocky@qawolf.com",
          expires_at: new Date("2000").toISOString(),
          i: 2,
        }),
        buildInvite({
          accepted_at: minutesFromNow(),
          email: "yeti@qawolf.com",
          i: 3,
        }),
      ]);
    });

    afterAll(() => db("invites").del());

    it("returns non-expired invites for a team", async () => {
      const invites = await findInvitesForTeam("teamId", options);

      expect(invites).toMatchObject([{ id: "inviteId" }]);
    });
  });

  describe("hasInvitedUser", () => {
    it("returns false if only one user and no invites", async () => {
      expect(await hasInvitedUser("teamId", options)).toBe(false);
    });

    it("returns true if multiple users", async () => {
      await db("team_users").insert([
        buildTeamUser({}),
        buildTeamUser({ i: 2, user_id: "user2Id" }),
      ]);

      expect(await hasInvitedUser("teamId", options)).toBe(true);

      await db("team_users").del();
    });

    it("returns true if one user and one invite", async () => {
      await db("invites").insert(buildInvite({}));

      expect(await hasInvitedUser("teamId", options)).toBe(true);

      await db("invites").del();
    });
  });

  describe("updateInvite", () => {
    beforeAll(() => {
      return db("invites").insert([
        buildInvite({}),
        buildInvite({
          email: "rocky@qawolf.com",
          expires_at: new Date("2000").toISOString(),
          i: 2,
        }),
        buildInvite({
          accepted_at: minutesFromNow(),
          email: "yeti@qawolf.com",
          i: 3,
        }),
      ]);
    });

    afterAll(() => db("invites").del());

    it("updates an invite", async () => {
      await updateInvite("inviteId", options);

      const invite = await db
        .select("*")
        .from("invites")
        .where({ id: "inviteId" })
        .first();

      expect(invite.accepted_at).toBeTruthy();
      expect(invite.updated_at).toEqual(invite.accepted_at);
    });

    it("throws an error if invite not found", async () => {
      await expect(updateInvite("fakeId", options)).rejects.toThrowError(
        "not found"
      );
    });

    it("throws an error if invite already accepted", async () => {
      await expect(updateInvite("invite3Id", options)).rejects.toThrowError(
        "already accepted"
      );
    });

    it("throws an error if invite expired", async () => {
      await expect(updateInvite("invite2Id", options)).rejects.toThrowError(
        "invite expired"
      );
    });
  });
});
