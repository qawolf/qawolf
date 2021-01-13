import { db, dropTestDb, migrateDb } from "../../../server/db";
import { integrationsResolver } from "../../../server/resolvers/integration";
import {
  buildIntegration,
  buildTeam,
  buildTeamUser,
  buildUser,
  logger,
} from "../utils";

const teams = [buildTeam({})];
const user = buildUser({});

const testContext = { api_key: null, ip: null, logger, teams, user };

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(user);
  await db("teams").insert(teams);
  await db("team_users").insert(buildTeamUser({}));

  await db("integrations").insert(buildIntegration({}));
});

afterAll(() => dropTestDb());

describe("integrationsResolver", () => {
  it("returns integrations for a team", async () => {
    const integrations = await integrationsResolver(
      {},
      { team_id: "teamId" },
      testContext
    );

    expect(integrations).toMatchObject([{ id: "integrationId" }]);
  });
});
