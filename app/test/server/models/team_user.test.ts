import { createTeamUser } from "../../../server/models/team_user";
import { prepareTestDb } from "../db";
import { buildTeam, buildUser, logger } from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  return db("teams").insert(buildTeam({}));
});

describe("team_user model", () => {
  describe("createTeamUser", () => {
    afterEach(() => db("team_users").del());

    it("creates an team_user", async () => {
      await createTeamUser(
        {
          team_id: "teamId",
          role: "admin",
          user_id: "userId",
        },
        options
      );
      const teamUsers = await db.select("*").from("team_users");

      expect(teamUsers).toMatchObject([
        {
          team_id: "teamId",
          id: expect.any(String),
          role: "admin",
          user_id: "userId",
        },
      ]);
    });

    it("does not create team user if user already on team", async () => {
      await createTeamUser(
        {
          team_id: "teamId",
          role: "admin",
          user_id: "userId",
        },
        options
      );

      await expect(
        createTeamUser(
          {
            team_id: "teamId",
            role: "admin",
            user_id: "userId",
          },
          options
        )
      ).rejects.toThrowError("user already on team");
    });
  });
});
