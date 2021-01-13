import { db, dropTestDb, migrateDb } from "../../../server/db";
import { createTeamUser } from "../../../server/models/team_user";
import { TeamUser } from "../../../server/types";
import { buildTeam, buildUser, logger } from "../utils";

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  return db("teams").insert(buildTeam({}));
});

afterAll(() => dropTestDb());

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
        { logger }
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
        { logger }
      );

      const testFn = async (): Promise<TeamUser> => {
        return createTeamUser(
          {
            team_id: "teamId",
            role: "admin",
            user_id: "userId",
          },
          { logger }
        );
      };

      await expect(testFn()).rejects.toThrowError("user already on team");
    });
  });
});
