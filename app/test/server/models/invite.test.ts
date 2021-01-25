import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  createInvite,
  deleteInvite,
  findInvite,
  findInvitesForTeam,
  updateInvite,
} from "../../../server/models/invite";
import { WOLF_NAMES, WOLF_VARIANTS } from "../../../server/models/wolfOptions";
import { Invite } from "../../../server/types";
import { minutesFromNow } from "../../../shared/utils";
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

beforeAll(async () => {
  await migrateDb();

  await db("teams").insert([team, buildTeam({ i: 2 })]);
  await db("users").insert([user, user2]);
});

afterAll(() => dropTestDb());

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
        { logger }
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
        { logger }
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
        { logger }
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
        { logger }
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
      const testFn = async (): Promise<Invite> => {
        return createInvite(
          { creator_id: "userId", email: user.email, team_id: "teamId" },
          { logger }
        );
      };

      await expect(testFn()).rejects.toThrowError("already on team");
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

      await deleteInvite("inviteId", { logger });

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
      const invite = await findInvite("inviteId", { logger });

      expect(invite).toMatchObject({
        creator_email: user.email,
        id: "inviteId",
        team_name: team.name,
      });
    });

    it("throws an error if invite not found", async () => {
      const testFn = async (): Promise<Invite> => {
        return findInvite("fakeId", { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");
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
      const invites = await findInvitesForTeam("teamId", { logger });

      expect(invites).toMatchObject([{ id: "inviteId" }]);
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
      await updateInvite("inviteId", { logger });

      const invite = await db
        .select("*")
        .from("invites")
        .where({ id: "inviteId" })
        .first();

      expect(invite.accepted_at).toBeTruthy();
      expect(invite.updated_at).toEqual(invite.accepted_at);
    });

    it("throws an error if invite not found", async () => {
      const testFn = async (): Promise<Invite> => {
        return updateInvite("fakeId", { logger });
      };

      await expect(testFn()).rejects.toThrowError("not found");
    });

    it("throws an error if invite already accepted", async () => {
      const testFn = async (): Promise<Invite> => {
        return updateInvite("invite3Id", { logger });
      };

      await expect(testFn()).rejects.toThrowError("already accepted");
    });

    it("throws an error if invite expired", async () => {
      const testFn = async (): Promise<Invite> => {
        return updateInvite("invite2Id", { logger });
      };

      await expect(testFn()).rejects.toThrowError("invite expired");
    });
  });
});
