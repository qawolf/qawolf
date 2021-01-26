import { db, dropTestDb, migrateDb } from "../../../server/db";
import { environmentsResolver } from "../../../server/resolvers/environment";
import { buildEnvironment, buildTeam, buildUser, testContext } from "../utils";

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));

  return db("environments").insert([
    buildEnvironment({}),
    buildEnvironment({ i: 2, name: "Production" }),
  ]);
});

afterAll(() => dropTestDb());

describe("environmentsResolver", () => {
  it("returns environments for a team", async () => {
    const environments = await environmentsResolver(
      {},
      { team_id: "teamId" },
      testContext
    );

    expect(environments).toMatchObject([
      { name: "Production" },
      { name: "Staging" },
    ]);
  });
});
