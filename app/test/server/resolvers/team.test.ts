import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  teamResolver,
  updateTeamResolver,
} from "../../../server/resolvers/team";
import { Team } from "../../../server/types";
import { buildTeam, buildTeamUser, buildUser, logger } from "../utils";

const testContext = {
  api_key: null,
  ip: "127.0.0.1",
  logger,
  teams: [buildTeam({})],
  user: buildUser({}),
};

beforeAll(() => migrateDb());

afterAll(() => dropTestDb());

describe("teamResolver", () => {
  beforeAll(async () => {
    await db("teams").insert(buildTeam({}));
    await db("users").insert(buildUser({}));

    return db("team_users").insert(buildTeamUser({}));
  });

  afterAll(async () => {
    await db("team_users").del();
    await db("users").del();

    return db("teams").del();
  });

  it("finds a team", async () => {
    const team = await teamResolver({}, { id: "teamId" }, testContext);
    expect(team).toMatchObject({ id: "teamId" });
  });
});

describe("updateTeamResolver", () => {
  beforeAll(async () => {
    await db("teams").insert(buildTeam({}));
    await db("users").insert(buildUser({}));

    return db("team_users").insert(buildTeamUser({}));
  });

  afterAll(async () => {
    await db("team_users").del();
    await db("users").del();

    return db("teams").del();
  });

  it("updates a team helpers", async () => {
    const team = await updateTeamResolver(
      {},
      { helpers: "helpers", id: "teamId" },
      testContext
    );

    expect(team.helpers).toBe("helpers");
  });

  it("updates a team name", async () => {
    const team = await updateTeamResolver(
      {},
      { id: "teamId", name: "another name" },
      testContext
    );

    expect(team.name).toBe("another name");
  });

  it("throws an error if no helpers or name passed", async () => {
    const testFn = async (): Promise<Team> => {
      return updateTeamResolver({}, { id: "teamId" }, testContext);
    };

    await expect(testFn()).rejects.toThrowError();
  });
});
