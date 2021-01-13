import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  acceptInviteResolver,
  createInvitesResolver,
  teamInvitesResolver,
} from "../../../server/resolvers/invite";
import * as emailService from "../../../server/services/alert/email";
import {
  buildInvite,
  buildTeam,
  buildTeamUser,
  buildUser,
  logger,
} from "../utils";

const testContext = {
  api_key: null,
  ip: null,
  logger,
  teams: [buildTeam({})],
  user: buildUser({}),
};

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(testContext.user);
  await db("teams").insert(testContext.teams);
  await db("team_users").insert(buildTeamUser({}));
});

afterAll(() => {
  jest.restoreAllMocks();
  return dropTestDb();
});

describe("acceptInviteResolver", () => {
  const user2 = buildUser({ i: 2 });

  beforeAll(async () => {
    await db("users").insert(user2);

    return db("invites").insert(buildInvite({}));
  });

  afterAll(async () => {
    await db("team_users").where({ user_id: "user2Id" }).del();
    await db("users").where({ id: "user2Id" }).del();

    return db("invites").del();
  });

  it("accepts an invite", async () => {
    const invite = await acceptInviteResolver(
      {},
      { id: "inviteId" },
      { api_key: null, ip: null, logger, teams: [], user: user2 }
    );

    expect(invite.accepted_at).toBeTruthy();
    expect(invite.team_id).toBe("teamId");

    const teamUser = await db
      .select("*")
      .from("team_users")
      .where({ user_id: "user2Id" })
      .first();

    expect(teamUser).toMatchObject({ team_id: "teamId", user_id: "user2Id" });
  });
});

describe("createInvitesResolver", () => {
  afterAll(() => db("invites").del());

  it("creates invites for a team", async () => {
    jest.spyOn(emailService, "sendEmailForInvite").mockResolvedValue();

    await createInvitesResolver(
      {},
      { emails: ["aspen@qawolf.com", "pumpkin@qawolf.com"], team_id: "teamId" },
      testContext
    );

    const invites = await db
      .select("*")
      .from("invites")
      .orderBy("email", "asc");

    expect(invites).toMatchObject([
      { email: "aspen@qawolf.com" },
      { email: "pumpkin@qawolf.com" },
    ]);

    expect(emailService.sendEmailForInvite).toBeCalledTimes(2);
  });
});

describe("teamInvitesResolver", () => {
  beforeAll(() => db("invites").insert(buildInvite({})));

  afterAll(() => db("invites").del());

  it("returns invites for team", async () => {
    const invites = await teamInvitesResolver(
      testContext.teams[0],
      {},
      testContext
    );

    expect(invites).toMatchObject([{ id: "inviteId" }]);
  });
});
